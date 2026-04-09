import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCommand } from "./run-command.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");

async function main() {
  const extraArgs = process.argv.slice(2);
  const deployEnv = {
    ...process.env,
    FRONTEND_EXPECT_SEO_ROUTES: "1",
  };

  await runCommand(process.execPath, [path.join(__dirname, "build-seo.mjs")], {
    cwd: FRONTEND_DIR,
    env: deployEnv,
  });

  await runCommand(process.execPath, [path.join(__dirname, "deploy-static.mjs"), ...extraArgs], {
    cwd: FRONTEND_DIR,
    env: deployEnv,
  });

  const shouldVerifyAfterDeploy = !["0", "false", "no", "off"].includes(
    String(process.env.FRONTEND_VERIFY_AFTER_DEPLOY || "1").trim().toLowerCase()
  );

  if (shouldVerifyAfterDeploy) {
    await runCommand(process.execPath, [path.join(__dirname, "verify-static-deploy.mjs")], {
      cwd: FRONTEND_DIR,
      env: deployEnv,
    });
  }
}

main().catch((error) => {
  console.error(`[deploy-static-seo] ${error.message}`);
  process.exit(1);
});
