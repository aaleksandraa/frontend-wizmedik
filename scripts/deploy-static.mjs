import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(FRONTEND_DIR, "dist");
const REPO_ROOT = path.resolve(FRONTEND_DIR, "..");
const DEFAULT_SERVER_TARGET = "/var/www/vhosts/wizmedik.com/httpdocs";
const DEFAULT_ALLOWED_BASENAMES = new Set([
  "httpdocs",
  "public_html",
  "htdocs",
  "wwwroot",
]);
const IN_PLACE_PRESERVE_NAMES = new Set([
  "dist",
  "src",
  "scripts",
  "public",
  "node_modules",
  ".git",
  ".github",
  ".vscode",
  ".idea",
  "coverage",
]);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let targetInput =
    args.target ||
    process.env.FRONTEND_DEPLOY_TARGET ||
    process.env.DEPLOY_TARGET_DIR;

  if (!targetInput && (await pathExists(DEFAULT_SERVER_TARGET))) {
    targetInput = DEFAULT_SERVER_TARGET;
    console.log(`[deploy-static] Using default production target: ${DEFAULT_SERVER_TARGET}`);
  }

  if (!targetInput) {
    throw new Error(
      [
        "Missing deploy target.",
        `Set FRONTEND_DEPLOY_TARGET or pass --target=/absolute/path/to/httpdocs.`,
        `Default server target '${DEFAULT_SERVER_TARGET}' was not found on this machine.`,
        "Example: FRONTEND_DEPLOY_TARGET=/var/www/vhosts/wizmedik.com/httpdocs npm run deploy:static:seo",
      ].join(" ")
    );
  }

  const targetDir = path.resolve(FRONTEND_DIR, targetInput);
  const allowAnyTarget = args.allowAnyTarget || parseBoolean(process.env.ALLOW_ANY_DEPLOY_TARGET);
  const inPlaceWebRoot = isSamePath(targetDir, FRONTEND_DIR);

  await ensureDirectory(DIST_DIR, "Build output not found. Run npm run build or npm run build:seo first.");
  await validateTarget(targetDir, allowAnyTarget, inPlaceWebRoot);

  if (inPlaceWebRoot) {
    console.log("[deploy-static] Detected in-place webroot layout. Syncing dist into current frontend directory...");
    await deployInPlace(targetDir);
    await verifyDeploy(targetDir);
    console.log("[deploy-static] Deployment completed successfully.");
    console.log("[deploy-static] Reminder: purge CDN/browser cache if production still serves old files.");
    return;
  }

  const parentDir = path.dirname(targetDir);
  await fs.mkdir(parentDir, { recursive: true });

  const stagingDir = path.join(parentDir, `${path.basename(targetDir)}.__deploy_tmp__`);
  const backupDir = path.join(parentDir, `${path.basename(targetDir)}.__deploy_backup__`);

  await cleanupPath(stagingDir);
  await cleanupPath(backupDir);

  console.log(`[deploy-static] Target: ${targetDir}`);
  console.log(`[deploy-static] Preparing staging directory...`);

  await fs.mkdir(stagingDir, { recursive: true });
  await copyDirectoryContents(DIST_DIR, stagingDir);

  console.log(`[deploy-static] Swapping staged build into place...`);

  const targetExists = await pathExists(targetDir);
  if (targetExists) {
    await fs.rename(targetDir, backupDir);
  }

  try {
    await fs.rename(stagingDir, targetDir);
  } catch (error) {
    if (targetExists && (await pathExists(backupDir))) {
      await cleanupPath(targetDir);
      await fs.rename(backupDir, targetDir);
    }

    throw error;
  }

  await cleanupPath(backupDir);

  await verifyDeploy(targetDir);

  console.log("[deploy-static] Deployment completed successfully.");
  console.log("[deploy-static] Reminder: purge CDN/browser cache if production still serves old files.");
}

function parseArgs(argv) {
  const args = {
    target: "",
    allowAnyTarget: false,
  };

  for (const arg of argv) {
    if (arg.startsWith("--target=")) {
      args.target = arg.slice("--target=".length).trim();
      continue;
    }

    if (arg === "--allow-any-target") {
      args.allowAnyTarget = true;
    }
  }

  return args;
}

function parseBoolean(value) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

async function validateTarget(targetDir, allowAnyTarget, inPlaceWebRoot) {
  const parsed = path.parse(targetDir);
  if (targetDir === parsed.root) {
    throw new Error(`Refusing to deploy to filesystem root: ${targetDir}`);
  }

  if (isSamePath(targetDir, REPO_ROOT) || isSamePath(targetDir, DIST_DIR)) {
    throw new Error(`Refusing to deploy into project source/build directory: ${targetDir}`);
  }

  if (!inPlaceWebRoot && isSamePath(targetDir, FRONTEND_DIR)) {
    throw new Error(`Refusing to deploy into project source/build directory: ${targetDir}`);
  }

  if (!inPlaceWebRoot && isSubPath(targetDir, REPO_ROOT)) {
    throw new Error(`Refusing to deploy inside repository tree: ${targetDir}`);
  }

  if (!allowAnyTarget) {
    const baseName = path.basename(targetDir).toLowerCase();
    if (!DEFAULT_ALLOWED_BASENAMES.has(baseName)) {
      throw new Error(
        [
          `Refusing to deploy to non-standard target '${targetDir}'.`,
          `Use a web-root style folder (${[...DEFAULT_ALLOWED_BASENAMES].join(", ")})`,
          "or pass --allow-any-target / set ALLOW_ANY_DEPLOY_TARGET=1 if this path is intentional.",
        ].join(" ")
      );
    }
  }
}

async function deployInPlace(targetDir) {
  const staleGeneratedDirs = await findStaleGeneratedRouteDirectories(targetDir);

  if (staleGeneratedDirs.length > 0) {
    console.log(`[deploy-static] Removing ${staleGeneratedDirs.length} stale prerendered route directories...`);
    for (const relativeDir of staleGeneratedDirs) {
      await cleanupPath(path.join(targetDir, relativeDir));
      await pruneEmptyParents(targetDir, path.dirname(relativeDir));
    }
  }

  console.log("[deploy-static] Refreshing assets directory...");
  await cleanupPath(path.join(targetDir, "assets"));

  console.log("[deploy-static] Copying fresh dist output into webroot...");
  await copyDirectoryContents(DIST_DIR, targetDir);
}

async function copyDirectoryContents(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await copyDirectoryContents(sourcePath, targetPath);
      continue;
    }

    if (entry.isSymbolicLink()) {
      const linkTarget = await fs.readlink(sourcePath);
      await fs.symlink(linkTarget, targetPath);
      continue;
    }

    await fs.copyFile(sourcePath, targetPath);
  }
}

async function findStaleGeneratedRouteDirectories(targetDir) {
  const currentGeneratedDirs = await collectGeneratedRouteDirectories(DIST_DIR);
  const deployedGeneratedDirs = await collectGeneratedRouteDirectories(targetDir, {
    ignoreTopLevelNames: IN_PLACE_PRESERVE_NAMES,
  });

  return [...deployedGeneratedDirs].filter((relativeDir) => !currentGeneratedDirs.has(relativeDir));
}

async function collectGeneratedRouteDirectories(baseDir, options = {}) {
  const results = new Set();
  const ignoreTopLevelNames = options.ignoreTopLevelNames || new Set();

  async function walk(currentDir, relativeDir = "") {
    const entries = await fs.readdir(currentDir, { withFileTypes: true }).catch(() => []);
    const hasIndexHtml = entries.some((entry) => !entry.isDirectory() && entry.name === "index.html");

    if (relativeDir && hasIndexHtml) {
      results.add(relativeDir.replace(/\\/g, "/"));
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (!relativeDir && ignoreTopLevelNames.has(entry.name)) {
        continue;
      }

      const nextRelativeDir = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
      await walk(path.join(currentDir, entry.name), nextRelativeDir);
    }
  }

  await walk(baseDir);
  return results;
}

async function pruneEmptyParents(rootDir, relativeDir) {
  let currentRelativeDir = relativeDir;

  while (currentRelativeDir && currentRelativeDir !== ".") {
    const absoluteDir = path.join(rootDir, currentRelativeDir);
    const entries = await fs.readdir(absoluteDir).catch(() => null);

    if (!entries || entries.length > 0) {
      break;
    }

    await fs.rmdir(absoluteDir).catch(() => null);
    currentRelativeDir = path.dirname(currentRelativeDir);
  }
}

async function verifyDeploy(targetDir) {
  const requiredEntries = [
    path.join(targetDir, "index.html"),
    path.join(targetDir, ".htaccess"),
    path.join(targetDir, "sw.js"),
    path.join(targetDir, "assets"),
  ];

  for (const requiredEntry of requiredEntries) {
    if (!(await pathExists(requiredEntry))) {
      throw new Error(`Deploy verification failed. Missing ${requiredEntry}`);
    }
  }
}

async function ensureDirectory(directory, errorMessage) {
  const stats = await fs.stat(directory).catch(() => null);
  if (!stats || !stats.isDirectory()) {
    throw new Error(errorMessage);
  }
}

async function cleanupPath(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true }).catch((error) => {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  });
}

async function pathExists(targetPath) {
  return Boolean(await fs.stat(targetPath).catch(() => null));
}

function isSubPath(candidatePath, parentPath) {
  const relativePath = path.relative(parentPath, candidatePath);
  return relativePath !== "" && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}

function isSamePath(left, right) {
  return path.resolve(left) === path.resolve(right);
}

main().catch((error) => {
  console.error(`[deploy-static] ${error.message}`);
  process.exit(1);
});
