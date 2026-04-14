import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "..", "dist");
const MANIFEST_PATH = path.join(DIST_DIR, ".seo-prerendered-paths.json");

async function main() {
  const manifest = await loadManifest();
  const missingTargets = [];

  for (const target of manifest) {
    const targetFile = targetFilePath(target);

    if (!(await fileExists(targetFile))) {
      missingTargets.push({
        target,
        file: targetFile,
      });
    }
  }

  if (missingTargets.length > 0) {
    const preview = missingTargets
      .slice(0, 10)
      .map(({ target, file }) => `- ${displayTarget(target)} -> ${file}`)
      .join("\n");

    throw new Error(
      [
        `Missing ${missingTargets.length} prerendered SEO route file(s).`,
        preview,
        missingTargets.length > 10 ? `- ...and ${missingTargets.length - 10} more` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  const detailCounts = summarizeDetailRoutes(manifest);

  console.log(`[verify-seo-output] Verified ${manifest.length} prerender target(s).`);
  console.log(
    [
      `[verify-seo-output] Blog details: ${detailCounts.blog}`,
      `Questions: ${detailCounts.questions}`,
      `Doctors: ${detailCounts.doctors}`,
    ].join(" | ")
  );
}

async function loadManifest() {
  const raw = await readFile(MANIFEST_PATH, "utf8").catch(() => "");

  if (!raw) {
    throw new Error(`SEO prerender manifest not found: ${MANIFEST_PATH}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid SEO prerender manifest JSON: ${error.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`SEO prerender manifest must be an array: ${MANIFEST_PATH}`);
  }

  return parsed.filter((entry) => typeof entry === "string");
}

function targetFilePath(routeTarget) {
  const relativeOutputPath = relativeOutputPathForRouteTarget(routeTarget);

  if (!relativeOutputPath) {
    return path.join(DIST_DIR, "index.html");
  }

  return path.join(DIST_DIR, ...relativeOutputPath.split("/"), "index.html");
}

function relativeOutputPathForRouteTarget(routeTarget) {
  const [pathname, queryString] = splitRouteTarget(routeTarget);

  if (!pathname) {
    return "";
  }

  const query = new URLSearchParams(queryString);
  const pharmacyMatch = pathname.match(/^apoteke\/([^/]+)$/);

  if (pharmacyMatch) {
    const citySlug = pharmacyMatch[1];
    const hasDuty = queryFlagIsEnabled(query.get("dezurna_now"));
    const has24Hour = queryFlagIsEnabled(query.get("is_24h"));

    if (hasDuty && !has24Hour) {
      return `__query/apoteke/${citySlug}/dezurna_now`;
    }

    if (has24Hour && !hasDuty) {
      return `__query/apoteke/${citySlug}/is_24h`;
    }
  }

  return pathname;
}

function splitRouteTarget(routeTarget) {
  const [pathname, queryString = ""] = String(routeTarget || "").split("?", 2);
  return [pathname.replace(/^\/|\/$/g, ""), queryString];
}

function queryFlagIsEnabled(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function displayTarget(target) {
  return target ? `/${target}` : "/";
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function summarizeDetailRoutes(manifest) {
  return {
    blog: manifest.filter((route) => typeof route === "string" && /^blog\/[^/?]+$/.test(route)).length,
    questions: manifest.filter((route) => typeof route === "string" && /^pitanja\/[^/?]+$/.test(route)).length,
    doctors: manifest.filter((route) => typeof route === "string" && /^doktor\/[^/?]+$/.test(route)).length,
  };
}

main().catch((error) => {
  console.error(`[verify-seo-output] ${error.message}`);
  process.exit(1);
});
