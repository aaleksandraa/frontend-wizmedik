import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "..", "dist");
const MANIFEST_FILE = path.join(DIST_DIR, ".seo-prerendered-paths.json");

const FRONTEND_ORIGIN = normalizeOrigin(
  process.env.PRERENDER_FRONTEND_URL ||
    process.env.VITE_SITE_URL ||
    process.env.VITE_FRONTEND_URL ||
    "https://wizmedik.com"
);
const SEO_SOURCE_ORIGIN = normalizeOrigin(
  process.env.PRERENDER_SEO_SOURCE_URL ||
    process.env.PRERENDER_API_ORIGIN ||
    process.env.VITE_API_BASE_URL ||
    process.env.VITE_API_URL ||
    "https://api.wizmedik.com"
);

const CONCURRENCY = Math.max(1, Number(process.env.PRERENDER_CONCURRENCY || 8));
const REQUEST_TIMEOUT_MS = Math.max(5000, Number(process.env.PRERENDER_TIMEOUT_MS || 25000));
const INCLUDE_ROOT = parseBoolean(process.env.PRERENDER_INCLUDE_ROOT, false);
const STRICT_FAILURE = parseBoolean(process.env.PRERENDER_STRICT_FAILURE, false);

const FALLBACK_SITEMAPS = [
  "sitemap-pages.xml",
  "sitemap-doctors.xml",
  "sitemap-clinics.xml",
  "sitemap-specialties.xml",
  "sitemap-service-pages.xml",
  "sitemap-cities.xml",
  "sitemap-laboratories.xml",
  "sitemap-pharmacies.xml",
  "sitemap-spas.xml",
  "sitemap-care-homes.xml",
  "sitemap-doctor-city-specialties.xml",
  "sitemap-blog.xml",
  "sitemap-pitanja.xml",
  "sitemap-lijekovi.xml",
];

async function main() {
  await ensureDistDirectory();

  const paths = await collectPaths();
  if (paths.length === 0) {
    console.warn("[seo-prerender] No paths found in sitemaps. Nothing to do.");
    return;
  }

  const previousPaths = await readPreviousManifest();
  await deleteRemovedPaths(previousPaths, paths);

  let rendered = 0;
  let failed = 0;
  let failedLogCount = 0;

  await runWithConcurrency(paths, CONCURRENCY, async (routePath, index, total) => {
    const displayPath = routePath === "" ? "/" : `/${routePath}`;

    try {
      const html = await fetchRouteHtml(routePath);
      const finalHtml = enforcePublicUrlMeta(html, routePath);
      const outputFile = targetFilePath(routePath);
      await fs.mkdir(path.dirname(outputFile), { recursive: true });
      await fs.writeFile(outputFile, finalHtml, "utf8");
      rendered += 1;

      if (index % 50 === 0 || index === total - 1) {
        console.log(`[seo-prerender] ${index + 1}/${total} processed`);
      }
    } catch (error) {
      if (routePath === "" && isHttpStatusError(error, 404)) {
        console.warn("[seo-prerender] Skipping root '/': source returned HTTP 404");
        return;
      }

      failed += 1;
      if (failedLogCount < 50) {
        console.warn(`[seo-prerender] Failed ${displayPath}: ${error.message}`);
        failedLogCount += 1;
      } else if (failedLogCount === 50) {
        console.warn("[seo-prerender] Additional failures suppressed.");
        failedLogCount += 1;
      }
    }
  });

  await fs.writeFile(MANIFEST_FILE, JSON.stringify(paths, null, 2), "utf8");

  console.log(`[seo-prerender] Source: ${SEO_SOURCE_ORIGIN}`);
  console.log(`[seo-prerender] Frontend: ${FRONTEND_ORIGIN}`);
  console.log(`[seo-prerender] Rendered: ${rendered}`);
  console.log(`[seo-prerender] Failed: ${failed}`);

  if (rendered === 0) {
    console.error("[seo-prerender] No pages were rendered. Ensure /api/seo/render is deployed and reachable.");
    process.exitCode = 1;
    return;
  }

  if (failed > 0 && STRICT_FAILURE) {
    process.exitCode = 1;
  }
}

async function ensureDistDirectory() {
  const stats = await fs.stat(DIST_DIR).catch(() => null);
  if (!stats || !stats.isDirectory()) {
    throw new Error(`dist directory not found: ${DIST_DIR}`);
  }
}

async function collectPaths() {
  const sitemapUrls = await collectSitemapUrls();
  const pathSet = new Set();

  for (const sitemapUrl of sitemapUrls) {
    try {
      const xml = await fetchText(sitemapUrl, REQUEST_TIMEOUT_MS);
      const locs = extractLocValues(xml);

      for (const loc of locs) {
        const routePath = normalizeRoutePath(loc);
        if (routePath === null) {
          continue;
        }

        if (routePath === "" && !INCLUDE_ROOT) {
          continue;
        }

        pathSet.add(routePath);
      }
    } catch (error) {
      console.warn(`[seo-prerender] Sitemap fetch failed (${sitemapUrl}): ${error.message}`);
    }
  }

  if (INCLUDE_ROOT) {
    pathSet.add("");
  }

  return [...pathSet].sort(sortPaths);
}

async function collectSitemapUrls() {
  const sitemapIndexUrl = `${SEO_SOURCE_ORIGIN}/sitemap.xml`;

  try {
    const xml = await fetchText(sitemapIndexUrl, REQUEST_TIMEOUT_MS);
    const locs = extractLocValues(xml);
    const urls = locs
      .filter((loc) => /\.xml(?:\?.*)?$/i.test(loc))
      .map((loc) => coerceSitemapUrlToSource(loc))
      .filter(Boolean);

    if (urls.length > 0) {
      return [...new Set(urls)];
    }
  } catch (error) {
    console.warn(`[seo-prerender] Could not read sitemap index: ${error.message}`);
  }

  return FALLBACK_SITEMAPS.map((entry) => `${SEO_SOURCE_ORIGIN}/${entry}`);
}

function normalizeRoutePath(loc) {
  let url;
  try {
    url = new URL(loc, `${FRONTEND_ORIGIN}/`);
  } catch {
    return null;
  }

  let pathname = url.pathname || "/";
  pathname = pathname.replace(/\/+/g, "/");
  pathname = pathname.replace(/^\/|\/$/g, "");

  if (isSkippablePath(pathname)) {
    return null;
  }

  return pathname;
}

function isSkippablePath(pathname) {
  if (pathname === "favicon.ico" || pathname === "robots.txt") {
    return true;
  }

  if (pathname.startsWith("api/")) {
    return true;
  }

  if (pathname === "sitemap.xml" || pathname.startsWith("sitemap-")) {
    return true;
  }

  return /\.xml$/i.test(pathname);
}

function targetFilePath(routePath) {
  if (!routePath) {
    return path.join(DIST_DIR, "index.html");
  }

  return path.join(DIST_DIR, ...routePath.split("/"), "index.html");
}

function buildSourceUrl(routePath) {
  const route = routePath ? `/${routePath}` : "/";
  const params = new URLSearchParams({
    path: route,
  });

  return `${SEO_SOURCE_ORIGIN}/api/seo/render?${params.toString()}`;
}

function buildDirectSourceUrl(routePath) {
  if (!routePath) {
    return `${SEO_SOURCE_ORIGIN}/`;
  }

  const encodedPath = routePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${SEO_SOURCE_ORIGIN}/${encodedPath}`;
}

async function fetchRouteHtml(routePath) {
  const candidates = [buildSourceUrl(routePath), buildDirectSourceUrl(routePath)];
  const attempted = new Set();
  let lastError = new Error("No source candidates available");

  for (const candidate of candidates) {
    if (!candidate || attempted.has(candidate)) {
      continue;
    }

    attempted.add(candidate);

    try {
      return await fetchText(candidate, REQUEST_TIMEOUT_MS);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function enforcePublicUrlMeta(html, routePath) {
  const pageUrl = routePath ? `${FRONTEND_ORIGIN}/${routePath}` : `${FRONTEND_ORIGIN}/`;

  let next = html;
  next = next.replace(
    /(<link[^>]+rel=["']canonical["'][^>]+href=["'])[^"']*(["'][^>]*>)/i,
    `$1${pageUrl}$2`
  );
  next = next.replace(
    /(<meta[^>]+property=["']og:url["'][^>]+content=["'])[^"']*(["'][^>]*>)/i,
    `$1${pageUrl}$2`
  );
  next = next.replace(
    /(<meta[^>]+name=["']twitter:url["'][^>]+content=["'])[^"']*(["'][^>]*>)/i,
    `$1${pageUrl}$2`
  );

  return next;
}

function extractLocValues(xml) {
  const values = [];
  const regex = /<loc>([\s\S]*?)<\/loc>/gi;

  for (const match of xml.matchAll(regex)) {
    const raw = (match[1] || "").trim();
    if (!raw) {
      continue;
    }

    values.push(decodeXmlEntities(raw));
  }

  return values;
}

function decodeXmlEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'");
}

function toAbsoluteUrl(urlLike, base) {
  try {
    return new URL(urlLike, `${base}/`).toString();
  } catch {
    return null;
  }
}

function coerceSitemapUrlToSource(loc) {
  const parsed = toAbsoluteUrl(loc, SEO_SOURCE_ORIGIN);
  if (!parsed) {
    return null;
  }

  try {
    const url = new URL(parsed);
    if (!/\.xml$/i.test(url.pathname)) {
      return null;
    }

    return `${SEO_SOURCE_ORIGIN}${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function normalizeOrigin(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);

  let pathname = parsed.pathname.replace(/\/+$/, "");
  if (pathname.toLowerCase() === "/api") {
    pathname = "";
  }

  return `${parsed.origin}${pathname}`;
}

function parseBoolean(value, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function sortPaths(a, b) {
  if (a.length !== b.length) {
    return a.length - b.length;
  }
  return a.localeCompare(b);
}

async function fetchText(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "wizmedik-seo-prerender/1.0",
        accept: "text/html,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function isHttpStatusError(error, statusCode) {
  const message = String(error?.message || "");
  return message.includes(`HTTP ${statusCode}`);
}

async function readPreviousManifest() {
  const raw = await fs.readFile(MANIFEST_FILE, "utf8").catch(() => "");
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry) => typeof entry === "string");
  } catch {
    return [];
  }
}

async function deleteRemovedPaths(previousPaths, currentPaths) {
  const currentSet = new Set(currentPaths);

  for (const routePath of previousPaths) {
    if (currentSet.has(routePath)) {
      continue;
    }

    if (!routePath) {
      continue;
    }

    const filePath = targetFilePath(routePath);
    await fs.unlink(filePath).catch(() => null);
    await removeEmptyParents(path.dirname(filePath), DIST_DIR);
  }
}

async function removeEmptyParents(startDir, stopDir) {
  let current = path.resolve(startDir);
  const stop = path.resolve(stopDir);

  while (current.startsWith(stop) && current !== stop) {
    let entries;
    try {
      entries = await fs.readdir(current);
    } catch {
      return;
    }

    if (entries.length > 0) {
      return;
    }

    await fs.rmdir(current).catch(() => null);
    current = path.dirname(current);
  }
}

async function runWithConcurrency(items, limit, worker) {
  if (items.length === 0) {
    return;
  }

  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      await worker(items[current], current, items.length);
    }
  };

  const count = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: count }, runWorker));
}

main().catch((error) => {
  console.error(`[seo-prerender] Fatal error: ${error.message}`);
  process.exit(1);
});
