import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCommand } from "./run-command.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");

async function main() {
  const extraArgs = process.argv.slice(2);

  await runCommand(process.execPath, [path.join(__dirname, "build-seo.mjs")], {
    cwd: FRONTEND_DIR,
  });

  await runCommand(process.execPath, [path.join(__dirname, "deploy-static.mjs"), ...extraArgs], {
    cwd: FRONTEND_DIR,
  });
}

main().catch((error) => {
  console.error(`[deploy-static-seo] ${error.message}`);
  process.exit(1);
});
