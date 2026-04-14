import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCommand } from "./run-command.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(FRONTEND_DIR, "..");
const OUTPUT_DIR = path.join(FRONTEND_DIR, "dist");
const PRODUCTION_WEBROOT_NAMES = new Set(["httpdocs", "public_html", "htdocs", "public", "wwwroot"]);

async function main() {
  const mode = String(process.env.SEO_PRERENDER_MODE || "auto").trim().toLowerCase();
  const backendArtisanPath = await resolveBackendArtisanPath();
  const productionLikeLayout = isProductionLikeLayout(FRONTEND_DIR);

  if (mode === "remote") {
    await runRemotePrerender();
    await verifySeoOutput();
    return;
  }

  if (backendArtisanPath) {
    try {
      await runLocalArtisanPrerender(backendArtisanPath);
      return;
    } catch (error) {
      if (mode === "local") {
        throw error;
      }

      if (productionLikeLayout) {
        throw new Error(
          [
            `Local artisan prerender failed for '${backendArtisanPath}'.`,
            "Refusing unsafe remote fallback in production-like webroot layout.",
            `Original error: ${error.message}`,
            "Fix the backend artisan path or set SEO_PRERENDER_MODE=remote only if you intentionally want remote prerender.",
          ].join(" ")
        );
      }

      console.warn(`[seo-prerender] Local artisan prerender failed, falling back to remote mode: ${error.message}`);
    }
  } else if (mode === "local") {
    throw new Error(buildMissingArtisanMessage());
  } else if (productionLikeLayout) {
    throw new Error(
      [
        buildMissingArtisanMessage(),
        "Refusing remote sitemap/source prerender in production-like webroot layout because it can keep stale nested routes alive.",
        "Set BACKEND_ARTISAN_PATH to your production artisan file or explicitly set SEO_PRERENDER_MODE=remote to override.",
      ].join(" ")
    );
  }

  await runRemotePrerender();
  await verifySeoOutput();
}

async function runLocalArtisanPrerender(backendArtisanPath) {
  console.log(`[seo-prerender] Using local backend artisan prerender: ${backendArtisanPath}`);
  await runCommand("php", [backendArtisanPath, "seo:prerender-pages", `--output=${OUTPUT_DIR}`], {
    cwd: path.dirname(backendArtisanPath),
  });

  await verifySeoOutput();
}

async function runRemotePrerender() {
  console.log("[seo-prerender] Using remote sitemap/source prerender.");
  await runCommand(process.execPath, [path.join(__dirname, "prerender-seo-pages.mjs")], {
    cwd: FRONTEND_DIR,
  });
}

async function verifySeoOutput() {
  await runCommand(process.execPath, [path.join(__dirname, "verify-seo-output.mjs")], {
    cwd: FRONTEND_DIR,
  });
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveBackendArtisanPath() {
  const candidates = buildBackendArtisanCandidates();

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return "";
}

function buildBackendArtisanCandidates() {
  const fromEnv = [
    process.env.BACKEND_ARTISAN_PATH,
    process.env.SEO_PRERENDER_ARTISAN_PATH,
    process.env.LARAVEL_ARTISAN_PATH,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .map((value) => path.resolve(FRONTEND_DIR, value));

  const suffixes = [
    path.join("backend", "artisan"),
    "artisan",
    path.join("api.wizmedik.com", "artisan"),
    path.join("api.wizmedik.com", "backend", "artisan"),
  ];

  const discovered = [];
  let currentDir = FRONTEND_DIR;

  while (true) {
    for (const suffix of suffixes) {
      discovered.push(path.join(currentDir, suffix));
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return uniquePaths([...fromEnv, ...discovered]);
}

function uniquePaths(paths) {
  const seen = new Set();
  const results = [];

  for (const currentPath of paths) {
    const resolvedPath = path.resolve(currentPath);
    if (seen.has(resolvedPath)) {
      continue;
    }

    seen.add(resolvedPath);
    results.push(resolvedPath);
  }

  return results;
}

function buildMissingArtisanMessage() {
  const candidates = buildBackendArtisanCandidates();
  const preview = candidates.slice(0, 8).join(", ");
  return [
    "Backend artisan not found.",
    `Checked candidates: ${preview}${candidates.length > 8 ? ", ..." : ""}`,
  ].join(" ");
}

function isProductionLikeLayout(frontendDir) {
  const normalized = path.resolve(frontendDir);
  const baseName = path.basename(normalized).toLowerCase();
  return PRODUCTION_WEBROOT_NAMES.has(baseName);
}

main().catch((error) => {
  console.error(`[seo-prerender] ${error.message}`);
  process.exit(1);
});
