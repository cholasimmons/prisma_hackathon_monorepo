import { Elysia } from "elysia";

type CorsOptions = {
  origins?: string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
};

export const corsPlugin = (options: CorsOptions = {}) =>
  new Elysia({ name: "custom-cors" })

    /* ---------- PRE-FLIGHT ---------- */
    .onRequest(({ request, set, status }) => {
      if (request.method !== "OPTIONS") return;

      const origin = request.headers.get("origin");
      if (!origin) return;

      console.log("[CORS] | onRequest OPTIONS: origin: ", origin);
      console.log(
        "[CORS] | onRequest OPTIONS: allowed origins: ",
        options.origins,
      );

      if (!isOriginAllowed(origin, options.origins)) return;

      set.headers = applyCorsHeaders(set.headers, origin, options);

      console.log("[CORS] | onRequest HEADERS: ", set.headers);

      set.status = 204;
      return status(204, null); // short-circuit routing
    })

    /* ---------- NORMAL RESPONSES ---------- */
    .onAfterHandle(({ request, set }) => {
      const origin = request.headers.get("origin");
      if (!origin) return;

      console.log(
        "[CORS] | onAfterHandle ",
        request.method,
        ": origin: ",
        origin,
      );

      if (!isOriginAllowed(origin, options.origins)) return;

      set.headers = applyCorsHeaders(set.headers, origin, options);
    })

    /* ---------- ERRORS ---------- */
    .onError(({ request, set }) => {
      const origin = request.headers.get("origin");
      if (!origin) return;

      if (!isOriginAllowed(origin, options.origins)) return;

      set.headers = applyCorsHeaders(set.headers, origin, options);
    });

type ElysiaHeaders = Record<string, string | number>;

function isOriginAllowed(
  origin: string,
  allowed?: string[] | ((origin: string) => boolean),
) {
  if (!allowed) return true;

  if (typeof allowed === "function") {
    return allowed(origin);
  }

  return allowed.includes(origin);
}

function applyCorsHeaders(
  headers: ElysiaHeaders,
  origin: string,
  options: any,
) {
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Vary"] = "Origin";

  headers["Access-Control-Allow-Methods"] = (
    options.methods ?? ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  ).join(", ");

  headers["Access-Control-Allow-Headers"] = (
    options.allowedHeaders ?? [
      "Content-Type",
      "Authorization",
      "Credentials",
      "X-Requested-With",
    ]
  ).join(", ");

  if (options.exposedHeaders?.length) {
    headers["Access-Control-Expose-Headers"] =
      options.exposedHeaders.join(", ");
  }

  if (options.credentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  if (options.maxAge) {
    headers["Access-Control-Max-Age"] = String(options.maxAge);
  }

  headers["x-powered-by"] = "Simmons Multimedia";

  return headers;
}
