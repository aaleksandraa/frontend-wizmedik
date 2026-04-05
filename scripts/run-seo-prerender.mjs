import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCommand } from "./run-command.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(FRONTEND_DIR, "..");
const BACKEND_ARTISAN = path.join(REPO_ROOT, "backend", "artisan");
const OUTPUT_DIR = path.join(FRONTEND_DIR, "dist");

async function main() {
  const mode = String(process.env.SEO_PRERENDER_MODE || "auto").trim().toLowerCase();

  if (mode === "remote") {
    await runRemotePrerender();
    return;
  }

  const artisanExists = await fileExists(BACKEND_ARTISAN);

  if (artisanExists) {
    try {
      await runLocalArtisanPrerender();
      return;
    } catch (error) {
      if (mode === "local") {
        throw error;
      }

      console.warn(`[seo-prerender] Local artisan prerender failed, falling back to remote mode: ${error.message}`);
    }
  } else if (mode === "local") {
    throw new Error(`Backend artisan not found: ${BACKEND_ARTISAN}`);
  }

  await runRemotePrerender();
}

async function runLocalArtisanPrerender() {
  console.log("[seo-prerender] Using local backend artisan prerender.");
  await runCommand("php", [BACKEND_ARTISAN, "seo:prerender-pages", `--output=${OUTPUT_DIR}`], {
    cwd: REPO_ROOT,
  });
}

async function runRemotePrerender() {
  console.log("[seo-prerender] Using remote sitemap/source prerender.");
  await runCommand(process.execPath, [path.join(__dirname, "prerender-seo-pages.mjs")], {
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

main().catch((error) => {
  console.error(`[seo-prerender] ${error.message}`);
  process.exit(1);
});
