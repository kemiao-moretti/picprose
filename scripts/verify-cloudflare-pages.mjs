import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

const nextConfig = read("next.config.mjs");
const layout = read("app/[locale]/layout.tsx");
const redirects = read("public/_redirects");
const functionSource = read("functions/api/unsplash.ts");
const smokeTest = read("scripts/smoke-cloudflare-pages.mjs");
const workflow = read(".github/workflows/cloudflare-pages.yml");

assert(
  nextConfig.includes("output:") && nextConfig.includes("'export'") && nextConfig.includes("NODE_ENV"),
  "next.config.mjs must enable static export for production while keeping dev dynamic",
);
assert(
  layout.includes("generateStaticParams"),
  "the locale layout must define generateStaticParams for static export",
);
assert(redirects.trim() === "/ /zh/ 302", "public/_redirects must redirect / to /zh/");
assert(!existsSync(resolve(root, "middleware.ts")), "middleware.ts must not be deployed with static export");
assert(
  !existsSync(resolve(root, "app/api/unsplash/route.ts")),
  "the Next.js Unsplash route must be replaced by a Pages Function",
);
assert(existsSync(resolve(root, "functions/api/unsplash.ts")), "Pages Function is missing");
assert(existsSync(resolve(root, "scripts/smoke-cloudflare-pages.mjs")), "Pages smoke test is missing");
assert(smokeTest.includes("/api/unsplash"), "Pages smoke test must check the API route");
assert(
  functionSource.includes("UNSPLASH_API_KEY"),
  "Pages Function must read UNSPLASH_API_KEY at runtime",
);
assert(
  workflow.includes("cloudflare/wrangler-action@v4"),
  "workflow must use the Cloudflare Wrangler action",
);
assert(workflow.includes("pages project create"), "workflow must attempt to create the Pages project idempotently");
assert(workflow.includes("already exists"), "workflow must treat an existing Pages project as success");
assert(!workflow.includes("pages project list --json"), "workflow must not rely on `pages project list` parsing");
assert(workflow.includes("--production-branch=main"), "workflow must create the Pages project with main as production branch");
assert(workflow.includes("pages secret put UNSPLASH_API_KEY"), "workflow must configure the Pages runtime secret");
assert(workflow.includes("pages deploy out"), "workflow must deploy the out directory");
assert(
  workflow.includes("CLOUDFLARE_API_TOKEN"),
  "workflow must use CLOUDFLARE_API_TOKEN",
);
assert(
  workflow.includes("CLOUDFLARE_ACCOUNT_ID"),
  "workflow must use CLOUDFLARE_ACCOUNT_ID",
);
assert(
  workflow.includes("secrets.UNSPLASH_API_KEY"),
  "workflow must read UNSPLASH_API_KEY from GitHub Secrets",
);
assert(
  workflow.includes("test -f out/zh/index.html"),
  "workflow must verify the generated Chinese page",
);

if (failures.length > 0) {
  console.error("Cloudflare Pages verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Cloudflare Pages deployment configuration: PASS");
