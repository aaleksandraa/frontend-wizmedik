import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const SRC_DIR = path.join(FRONTEND_DIR, "src");

const HOOKS = [
  "useEffect",
  "useState",
  "useMemo",
  "useCallback",
  "useRef",
  "useContext",
  "useReducer",
  "useLayoutEffect",
  "useImperativeHandle",
  "useTransition",
  "useDeferredValue",
  "useId",
];

async function collectSourceFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await collectSourceFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx"))) {
      results.push(fullPath);
    }
  }

  return results;
}

function getReactImports(source) {
  const imports = new Set();
  const reactImportLines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("import") && /from\s+['"]react['"]/.test(line));

  for (const line of reactImportLines) {
    const namespaceMatch = line.match(/\*\s+as\s+(\w+)/);
    if (namespaceMatch) {
      imports.add(namespaceMatch[1]);
    }

    const defaultMatch = line.match(/^import\s+(\w+)(?:\s*,|\s+from)/);
    if (defaultMatch) {
      imports.add(defaultMatch[1]);
    }

    const namedMatch = line.match(/\{([^}]+)\}/);
    if (!namedMatch) {
      continue;
    }

    for (const entry of namedMatch[1].split(",")) {
      const cleaned = entry.trim();
      if (!cleaned) {
        continue;
      }

      const aliasMatch = cleaned.match(/^(\w+)\s+as\s+(\w+)$/);
      if (aliasMatch) {
        imports.add(aliasMatch[2]);
        continue;
      }

      imports.add(cleaned);
    }
  }

  return imports;
}

function stripCommentsAndStrings(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, "");
}

function verifyFileImports(filePath, source) {
  const cleanSource = stripCommentsAndStrings(source);
  const reactImports = getReactImports(source);
  const errors = [];

  for (const hook of HOOKS) {
    const directUsageRegex = new RegExp(`(^|[^.\\w])${hook}\\s*\\(`, "m");
    if (!directUsageRegex.test(cleanSource)) {
      continue;
    }

    if (!reactImports.has(hook)) {
      errors.push(hook);
    }
  }

  return errors;
}

async function main() {
  const files = await collectSourceFiles(SRC_DIR);
  const failures = [];

  for (const filePath of files) {
    const source = await fs.readFile(filePath, "utf8");
    const missingHooks = verifyFileImports(filePath, source);
    if (missingHooks.length > 0) {
      failures.push({
        filePath,
        missingHooks,
      });
    }
  }

  if (failures.length > 0) {
    console.error("[verify-react-hooks-imports] Missing React hook imports detected:");
    for (const failure of failures) {
      const relativePath = path.relative(FRONTEND_DIR, failure.filePath).replaceAll("\\", "/");
      console.error(` - ${relativePath}: ${failure.missingHooks.join(", ")}`);
    }
    process.exit(1);
  }

  console.log(`[verify-react-hooks-imports] OK (${files.length} source files checked)`);
}

main().catch((error) => {
  console.error(`[verify-react-hooks-imports] ${error.message}`);
  process.exit(1);
});
