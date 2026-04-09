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
  await runCommand(process.execPath, [path.join(__dirname, "verify-react-hooks-imports.mjs")], {
    cwd: FRONTEND_DIR,
  });
  await runCommand(process.execPath, [viteEntrypoint, "build"], { cwd: FRONTEND_DIR });
  await runCommand(process.execPath, [path.join(__dirname, "sync-htaccess.mjs")], {
    cwd: FRONTEND_DIR,
  });
}

main().catch((error) => {
  console.error(`[build-static] ${error.message}`);
  process.exit(1);
});
