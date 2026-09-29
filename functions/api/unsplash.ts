interface UnsplashEnvironment {
  UNSPLASH_API_KEY?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: UnsplashEnvironment;
}

const DEFAULT_PER_PAGE = 30;
const MAX_PER_PAGE = 30;

function parsePositiveInteger(
  value: string | null,
  fallback: number,
  maximum: number,
): number {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function getUnsplashError(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "errors" in payload) {
    const errors = payload.errors;

    if (Array.isArray(errors) && errors.length > 0) {
      return errors.join("，");
    }
  }

  return "Unsplash 请求失败";
}

export async function onRequestGet({
  request,
  env,
}: PagesFunctionContext): Promise<Response> {
  const apiKey = env.UNSPLASH_API_KEY;

  if (!apiKey) {
    return jsonResponse(
      {
        type: "error",
        errors: ["未配置 UNSPLASH_API_KEY"],
      },
      500,
    );
  }

  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get("query")?.trim();
  const page = parsePositiveInteger(requestUrl.searchParams.get("page"), 1, 100);
  const perPage = parsePositiveInteger(
    requestUrl.searchParams.get("perPage"),
    DEFAULT_PER_PAGE,
    MAX_PER_PAGE,
  );

  const upstreamUrl = new URL(
    query
      ? "https://api.unsplash.com/search/photos"
      : "https://api.unsplash.com/photos/random",
  );
  if (query) {
    upstreamUrl.searchParams.set("query", query);
    upstreamUrl.searchParams.set("page", String(page));
    upstreamUrl.searchParams.set("per_page", String(perPage));
  } else {
    upstreamUrl.searchParams.set("count", String(perPage));
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        accept: "application/json",
        authorization: `Client-ID ${apiKey}`,
      },
    });
    const payload = await upstreamResponse.json();

    if (!upstreamResponse.ok) {
      return jsonResponse(
        {
          type: "error",
          errors: [getUnsplashError(payload)],
        },
        upstreamResponse.status >= 400 && upstreamResponse.status < 500
          ? upstreamResponse.status
          : 502,
      );
    }

    return jsonResponse({
      type: "success",
      response: payload,
    });
  } catch {
    return jsonResponse(
      {
        type: "error",
        errors: ["无法连接 Unsplash"],
      },
      502,
    );
  }
}
