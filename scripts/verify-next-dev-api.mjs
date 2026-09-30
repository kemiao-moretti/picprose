import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const files = {
  package: readFileSync(resolve(root, "package.json"), "utf8"),
  devScript: existsSync(resolve(root, "scripts/next-dev.mjs"))
    ? readFileSync(resolve(root, "scripts/next-dev.mjs"), "utf8")
    : "",
  cleanupScript: existsSync(resolve(root, "scripts/clean-next-dev-api.mjs"))
    ? readFileSync(resolve(root, "scripts/clean-next-dev-api.mjs"), "utf8")
    : "",
  nextConfig: readFileSync(resolve(root, "next.config.mjs"), "utf8"),
};

const checks = [
  ["dev command uses the Next dev wrapper", files.package.includes('"dev": "node scripts/next-dev.mjs"')],
  ["dev wrapper creates the local Unsplash route", files.devScript.includes("app/api/unsplash/route.ts")],
  ["dev wrapper cleans the generated route", files.cleanupScript.includes("app/api/unsplash/route.ts")],
  ["production build cleans the generated route", files.package.includes('"prebuild": "node scripts/clean-next-dev-api.mjs"')],
  ["dev keeps dynamic Route Handlers", files.nextConfig.includes("process.env.NODE_ENV === 'development' ? undefined : 'export'")],
  ["root favicon exists", existsSync(resolve(root, "public/favicon.ico"))],
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failures.length > 0) {
  console.error("Next dev API verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Next dev API verification: PASS");
