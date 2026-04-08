import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const SOURCE_TEMPLATE_PATH = path.join(FRONTEND_DIR, "index.source.html");
const LIVE_INDEX_PATH = path.join(FRONTEND_DIR, "index.html");

export async function restoreSourceIndexHtml() {
  const templateExists = await pathExists(SOURCE_TEMPLATE_PATH);
  if (!templateExists) {
    throw new Error(
      `Missing source HTML template at ${SOURCE_TEMPLATE_PATH}. This file is required for in-place webroot builds.`
    );
  }

  const [templateHtml, currentHtml] = await Promise.all([
    fs.readFile(SOURCE_TEMPLATE_PATH, "utf8"),
    fs.readFile(LIVE_INDEX_PATH, "utf8").catch(() => ""),
  ]);

  if (currentHtml === templateHtml) {
    return;
  }

  await fs.writeFile(LIVE_INDEX_PATH, templateHtml, "utf8");
  console.log("[prepare-index-html] Restored source index.html from index.source.html");
}

async function pathExists(targetPath) {
  return Boolean(await fs.stat(targetPath).catch(() => null));
}
