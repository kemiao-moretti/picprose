const baseUrl = process.env.PAGES_SMOKE_URL;

if (!baseUrl) {
  console.error("PAGES_SMOKE_URL is required, for example http://127.0.0.1:8788");
  process.exit(1);
}

const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

async function request(path) {
  const response = await fetch(`${normalizedBaseUrl}${path}`, {
    redirect: "manual",
  });
  return {
    response,
    body: await response.text(),
  };
}

const root = await request("/");
const rootLocation = root.response.headers.get("location");
if (root.response.status !== 302 || !["/zh", "/zh/"].includes(rootLocation ?? "")) {
  throw new Error(
    `Expected / to return 302 Location /zh or /zh/, received ${root.response.status} ${rootLocation ?? ""}`,
  );
}

const page = await request("/zh/");
if (page.response.status !== 200 || !page.body.includes("PicProse")) {
  throw new Error(`Expected /zh/ to return the PicProse page, received ${page.response.status}`);
}

const api = await request("/api/unsplash?perPage=1");
if (api.response.status === 404) {
  throw new Error("Expected /api/unsplash to be routed to a Pages Function, received 404");
}

if (api.response.headers.get("content-type")?.includes("application/json") !== true) {
  throw new Error("Expected /api/unsplash to return JSON");
}

const payload = JSON.parse(api.body);
if (payload.type !== "success" && payload.type !== "error") {
  throw new Error(`Unexpected /api/unsplash response type: ${payload.type ?? "missing"}`);
}

console.log("Cloudflare Pages smoke test: PASS");
