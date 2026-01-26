import { Elysia } from "elysia";

const RESERVED = new Set([
  "success",
  "code",
  "message",
  "data",
  "meta",
  "errors",
]);

function isRecord(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object";
}

function unwrapStatusShape(v: unknown): unknown {
  if (!isRecord(v)) return v;

  // Elysia status() wrappers usually expose these keys
  const maybeCode = (v as any).code ?? (v as any).status;
  const maybeResponse = (v as any).response;

  if (typeof maybeCode === "number" && maybeResponse !== undefined) {
    return maybeResponse;
  }

  return v;
}

export const responseEnvelope = new Elysia({
  name: "response-envelope",
}).mapResponse(({ responseValue, set }) => {
  // console.log("responseEnvelope", responseValue, set);

  const status = Number(set.status) ?? 200;
  const success = status >= 200 && status < 300;

  // If handler returned a Response object, don't touch it.
  // (e.g. streaming, file download)
  // if (responseValue instanceof Response) return responseValue;
  responseValue = unwrapStatusShape(responseValue);

  // Default envelope
  let message = success ? "OK" : "Error";
  let meta: any = undefined;
  let errors: any = undefined;
  let data: any = null;

  if (isRecord(responseValue)) {
    // If the handler already used the envelope, normalize it
    const hasAnyReserved = Object.keys(responseValue).some((k) =>
      RESERVED.has(k),
    );

    if (hasAnyReserved) {
      if (typeof responseValue.message === "string")
        message = responseValue.message;
      if (isRecord(responseValue.meta)) meta = responseValue.meta;
      if ("errors" in responseValue) errors = (responseValue as any).errors;

      if ("data" in responseValue) {
        data = (responseValue as any).data ?? null;
      } else {
        // Move non-reserved keys into data
        const moved: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(responseValue)) {
          if (!RESERVED.has(k)) moved[k] = v;
        }
        data = Object.keys(moved).length ? moved : null;
      }

      // If they explicitly set success/code, keep them; otherwise derive
      const finalSuccess =
        typeof (responseValue as any).success === "boolean"
          ? (responseValue as any).success
          : success;

      const finalCode =
        typeof (responseValue as any).code === "number"
          ? (responseValue as any).code
          : status;

      const payload = {
        success: finalSuccess,
        code: finalCode,
        message,
        data,
        ...(meta ? { meta } : {}),
        ...(errors ? { errors } : {}),
      };

      set.headers["content-type"] = "application/json; charset=utf-8";
      return new Response(JSON.stringify(payload), { status });
    }

    // Plain object with no reserved keys -> treat whole object as data
    // primitives/arrays/etc
    const payload = {
      success,
      code: status,
      message,
      data: responseValue ?? null,
    };

    set.headers["content-type"] = "application/json; charset=utf-8";
    return new Response(JSON.stringify(payload), { status });
  }

  // Non-object (string, number, array, null, etc.) becomes data directly
  // primitives/arrays/etc
  const payload = {
    success,
    code: status,
    message,
    data: responseValue ?? null,
  };

  set.headers["content-type"] = "application/json; charset=utf-8";
  return new Response(JSON.stringify(payload), { status });
});
