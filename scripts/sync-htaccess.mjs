import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const SOURCE_FILE = path.join(FRONTEND_DIR, ".htaccess");
const DIST_DIR = path.join(FRONTEND_DIR, "dist");
const TARGET_FILE = path.join(DIST_DIR, ".htaccess");

const FORBIDDEN_RULE = /RewriteRule\s+\^sitemap.*api\.wizmedik\.com/i;

async function main() {
  const sourceContent = await fs.readFile(SOURCE_FILE, "utf8");

  if (FORBIDDEN_RULE.test(sourceContent)) {
    throw new Error(
      "Blocked build: frontend/.htaccess still contains sitemap redirect to api.wizmedik.com"
    );
  }

  const distStats = await fs.stat(DIST_DIR).catch(() => null);
  if (!distStats || !distStats.isDirectory()) {
    throw new Error(`dist directory not found: ${DIST_DIR}`);
  }

  await fs.writeFile(TARGET_FILE, sourceContent, "utf8");
  console.log(`[htaccess-sync] Synced ${SOURCE_FILE} -> ${TARGET_FILE}`);
}

main().catch((error) => {
  console.error(`[htaccess-sync] ${error.message}`);
  process.exit(1);
});

