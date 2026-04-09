const DEFAULT_ORIGIN = process.env.FRONTEND_VERIFY_ORIGIN || "https://wizmedik.com";
const DEFAULT_ROUTES = [
  "/",
  "/blog",
  "/gradovi",
  "/about",
  "/pitanja",
  "/domovi-njega",
  "/doktori",
  "/klinike",
  "/laboratorije",
  "/apoteke",
  "/banje",
];
const REQUEST_TIMEOUT_MS = Math.max(5000, Number(process.env.FRONTEND_VERIFY_TIMEOUT_MS || 20000));
const SERVICE_WORKER_MARKER = "// WizMedik service worker cleanup shim.";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const origin = normalizeOrigin(args.origin || DEFAULT_ORIGIN);
  const envRoutes = parseRouteList(process.env.FRONTEND_VERIFY_ROUTES || "");
  const routes = args.routes.length > 0
    ? uniqueRoutes(args.routes)
    : envRoutes.length > 0
      ? uniqueRoutes(envRoutes)
      : await buildDefaultRoutes();

  console.log(`[verify-deploy] Origin: ${origin}`);
  console.log(`[verify-deploy] Routes: ${routes.join(", ")}`);

  const rootResult = await fetchHtml(origin, "/");
  const rootAssets = extractCoreAssets(rootResult.html);

  if (!rootAssets.mainJs || !rootAssets.mainCss) {
    throw new Error("Could not determine root index assets from homepage HTML.");
  }

  console.log(`[verify-deploy] Root JS: ${rootAssets.mainJs}`);
  console.log(`[verify-deploy] Root CSS: ${rootAssets.mainCss}`);
  if (rootAssets.legacyJs) {
    console.log(`[verify-deploy] Root legacy JS: ${rootAssets.legacyJs}`);
  }

  await verifyServiceWorker(origin);
  const verifiedBundles = new Set();
  await verifyDynamicImportAssets(origin, rootAssets.mainJs, "root bundle");
  verifiedBundles.add(rootAssets.mainJs);

  const failures = [];

  for (const route of routes) {
    try {
      const routeAssets = await verifyRoute(origin, route, rootAssets);
      if (routeAssets.mainJs && !verifiedBundles.has(routeAssets.mainJs)) {
        await verifyDynamicImportAssets(origin, routeAssets.mainJs, `${route} bundle`);
        verifiedBundles.add(routeAssets.mainJs);
      }
      console.log(`[verify-deploy] PASS ${route}`);
    } catch (error) {
      failures.push(`${route}: ${error.message}`);
      console.error(`[verify-deploy] FAIL ${route}: ${error.message}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Deployment verification failed.\n${failures.join("\n")}`);
  }

  console.log("[verify-deploy] Deployment looks healthy.");
}

function parseArgs(argv) {
  const args = {
    origin: "",
    routes: [],
  };

  for (const arg of argv) {
    if (arg.startsWith("--origin=")) {
      args.origin = arg.slice("--origin=".length).trim();
      continue;
    }

    if (arg.startsWith("--route=")) {
      args.routes.push(arg.slice("--route=".length).trim());
    }
  }

  return args;
}

function parseRouteList(value) {
  return String(value)
    .split(/[,\n\r;]+/)
    .map((route) => route.trim())
    .filter(Boolean);
}

function uniqueRoutes(routes) {
  const routeSet = new Set();
  for (const route of routes) {
    routeSet.add(normalizeRoute(route));
  }

  return [...routeSet];
}

async function buildDefaultRoutes() {
  const routes = [...DEFAULT_ROUTES];
  const manifestRoutes = await loadManifestRoutes();

  const firstDoctorDetail = manifestRoutes.find((route) => route.startsWith("doktor/"));
  if (firstDoctorDetail) {
    routes.push(`/${firstDoctorDetail}`);
  }

  const firstQuestionDetail = manifestRoutes.find((route) => route.startsWith("pitanja/") && route !== "pitanja");
  if (firstQuestionDetail) {
    routes.push(`/${firstQuestionDetail}`);
  }

  const firstBlogDetail = manifestRoutes.find((route) => route.startsWith("blog/") && route !== "blog");
  if (firstBlogDetail) {
    routes.push(`/${firstBlogDetail}`);
  }

  return uniqueRoutes(routes);
}

async function loadManifestRoutes() {
  try {
    const { readFile, readdir } = await import("node:fs/promises");
    const { resolve, join, relative } = await import("node:path");
    const distDir = resolve(process.cwd(), "dist");
    const manifestPath = resolve(distDir, ".seo-prerendered-paths.json");
    const raw = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed.filter((entry) => typeof entry === "string");
    }

    const discovered = [];
    await collectRouteDirectories(distDir, "", discovered, readdir, join, relative);
    return discovered;
  } catch {
    try {
      const { readdir } = await import("node:fs/promises");
      const { resolve, join, relative } = await import("node:path");
      const distDir = resolve(process.cwd(), "dist");
      const discovered = [];
      await collectRouteDirectories(distDir, "", discovered, readdir, join, relative);
      return discovered;
    } catch {
      return [];
    }
  }
}

async function collectRouteDirectories(baseDir, relativeDir, results, readdir, join, relative) {
  const entries = await readdir(join(baseDir, relativeDir), { withFileTypes: true });
  const hasIndexHtml = entries.some((entry) => entry.isFile() && entry.name === "index.html");

  if (relativeDir && hasIndexHtml) {
    results.push(relativeDir.replace(/\\/g, "/"));
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const nextRelativeDir = relative(join(baseDir), join(baseDir, relativeDir, entry.name));
    await collectRouteDirectories(baseDir, nextRelativeDir, results, readdir, join, relative);
  }
}

function normalizeOrigin(origin) {
  return String(origin).trim().replace(/\/+$/, "");
}

function normalizeRoute(route) {
  const value = String(route || "/").trim();
  if (!value || value === "/") {
    return "/";
  }

  return value.startsWith("/") ? value : `/${value}`;
}

async function verifyServiceWorker(origin) {
  const response = await fetchWithTimeout(`${origin}/sw.js?deploy_verify=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`sw.js returned HTTP ${response.status}`);
  }

  const content = await response.text();
  if (!content.includes(SERVICE_WORKER_MARKER)) {
    throw new Error("sw.js is not the cleanup shim.");
  }

  console.log("[verify-deploy] PASS /sw.js");
}

async function verifyRoute(origin, route, rootAssets) {
  const { html } = await fetchHtml(origin, route);
  const routeAssets = extractCoreAssets(html);

  if (routeAssets.mainJs !== rootAssets.mainJs) {
    throw new Error(`main JS mismatch (${routeAssets.mainJs || "missing"} != ${rootAssets.mainJs})`);
  }

  if (routeAssets.mainCss !== rootAssets.mainCss) {
    throw new Error(`main CSS mismatch (${routeAssets.mainCss || "missing"} != ${rootAssets.mainCss})`);
  }

  if (rootAssets.legacyJs && routeAssets.legacyJs !== rootAssets.legacyJs) {
    throw new Error(`legacy JS mismatch (${routeAssets.legacyJs || "missing"} != ${rootAssets.legacyJs})`);
  }

  const assetUrls = extractAllAssetUrls(html);
  for (const assetPath of assetUrls) {
    const status = await fetchAssetStatus(origin, assetPath);
    if (status !== 200) {
      throw new Error(`asset ${assetPath} returned HTTP ${status}`);
    }
  }

  return routeAssets;
}

async function verifyDynamicImportAssets(origin, scriptPath, label) {
  const scriptUrl = new URL(scriptPath, `${origin}/`).toString();
  const response = await fetchWithTimeout(scriptUrl);
  if (!response.ok) {
    throw new Error(`${label} ${scriptPath} returned HTTP ${response.status}`);
  }

  const script = await response.text();
  const assetPaths = extractScriptAssetUrls(script);

  for (const assetPath of assetPaths) {
    const status = await fetchAssetStatus(origin, assetPath);
    if (status !== 200) {
      throw new Error(`${label} references missing asset ${assetPath} (HTTP ${status})`);
    }
  }

  console.log(`[verify-deploy] PASS ${label} asset graph (${assetPaths.length} assets)`);
}

async function fetchHtml(origin, route) {
  const separator = route.includes("?") ? "&" : "?";
  const url = `${origin}${route}${separator}deploy_verify=${Date.now()}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`${route} returned HTTP ${response.status}`);
  }

  return {
    url,
    html: await response.text(),
  };
}

function extractCoreAssets(html) {
  return {
    mainJs: firstMatch(html, /<script[^>]+type="module"[^>]+src="([^"]*\/assets\/index-[^"]+\.js)"/i),
    mainCss: firstMatch(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]*\/assets\/index-[^"]+\.css)"/i),
    legacyJs: firstMatch(html, /\/assets\/index-legacy-[^"' ]+\.js/i),
  };
}

function extractAllAssetUrls(html) {
  const matches = html.match(/\/assets\/[^"' )]+?\.(?:js|css)/gi) || [];
  return [...new Set(matches)];
}

function extractScriptAssetUrls(script) {
  const matches = script.match(/assets\/[^"'`\s)\\]+?\.(?:js|css)/gi) || [];
  return [...new Set(matches.map((assetPath) => (assetPath.startsWith("/") ? assetPath : `/${assetPath}`)))];
}

function firstMatch(input, regex) {
  const match = input.match(regex);
  if (!match) {
    return "";
  }

  return match[1] || match[0] || "";
}

async function fetchAssetStatus(origin, assetPath) {
  const absoluteUrl = new URL(assetPath, `${origin}/`).toString();

  const headResponse = await fetchWithTimeout(absoluteUrl, { method: "HEAD" }).catch(() => null);
  if (headResponse && headResponse.ok) {
    return headResponse.status;
  }

  if (headResponse && headResponse.status && headResponse.status !== 405) {
    return headResponse.status;
  }

  const getResponse = await fetchWithTimeout(absoluteUrl);
  try {
    await getResponse.body?.cancel?.();
  } catch {
    // Ignore stream cancellation failures.
  }

  return getResponse.status;
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      ...init,
      signal: controller.signal,
      headers: {
        "cache-control": "no-cache",
        pragma: "no-cache",
        ...(init.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

main().catch((error) => {
  console.error(`[verify-deploy] ${error.message}`);
  process.exit(1);
});
