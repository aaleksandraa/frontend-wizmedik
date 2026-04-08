import path from "node:path";
import { fileURLToPath } from "node:url";
import { restoreSourceIndexHtml } from "./prepare-index-html.mjs";
import { runCommand } from "./run-command.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const viteEntrypoint = path.join(
  FRONTEND_DIR,
  "node_modules",
  "vite",
  "bin",
  "vite.js"
);

async function main() {
  await restoreSourceIndexHtml();
  const extraArgs = process.argv.slice(2);
  await runCommand(process.execPath, [viteEntrypoint, ...(["dev", ...extraArgs])], {
    cwd: FRONTEND_DIR,
  });
}

main().catch((error) => {
  console.error(`[dev-static] ${error.message}`);
  process.exit(1);
});
