import { Context, Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { OpenAPI } from "~/utils/auth";
import { betterAuth } from "~/middleware/betterauth";
import cron, { Patterns } from "@elysiajs/cron";
import { helmet } from "elysia-helmet";
import { elysiaXSS } from "elysia-xss";
import { ip } from "elysia-ip";
import { Logestic } from "logestic";
import { rateLimit } from "elysia-rate-limit";
import { systemBoot, systemOff } from "~/utils/system";
import {
  authController,
  vehiclesController,
  fileController,
  logosController,
} from "~/modules/index";
import staticPlugin from "@elysiajs/static";

const PORT = Number(process.env.PORT || 3000);
const ENV = process.env.BUN_ENV ?? process.env.NODE_ENV;

const app = new Elysia({
  websocket: {
    idleTimeout: 30,
  },
  normalize: "typebox",
})
  .use(
    cors({
      origin: [process.env.ORIGIN_URL ?? "http://localhost:3001"],
      aot: false,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "content-type",
        "authorization",
        "credentials",
        "x-client-plate-normalized",
      ],
      credentials: true,
      maxAge: 600,
      preflight: true,
      // exposeHeaders: ["content-type", "authorization", "host", "user-agent", "origin"]
    }),
  )

  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )

  .use(helmet())
  .use(elysiaXSS({}))
  .use(ip())
  .use(Logestic.preset("commontz"))
  .use(
    rateLimit({
      scoping: "global",
      max: process.env.NODE_ENV === "production" ? 60 : 10,
      duration: 60 * 1000,
      errorResponse: "Server rate limit exceeded",
    }),
  )
  .use(
    cron({
      name: "cron-job",
      pattern: Patterns.EVERY_5_MINUTES,
      run: () => console.log("Cron job executed (5 minutes)"),
    }),
  )
  .use(staticPlugin({ indexHTML: false }))
  .use(betterAuth)
  .use(authController)
  .use(vehiclesController)
  .use(fileController)
  .use(logosController)

  .get("/", () => "Hello Stranger")

  .ws("/ws", {
    // 1. Define the schema for incoming messages
    body: t.Object({
      message: t.String(),
      // userId: t.Number()
    }),
    // Optional: Also validate query, headers, etc.
    // query: t.Object({
    //     token: t.String()
    // }),
    open(ws) {
      console.log("Client connected");
    },
    message(ws, message) {
      // Get schema from `ws.data`
      const { id } = ws.data.query;
      ws.send({
        id,
        message,
        time: Date.now(),
      });
    },
    close(ws) {
      console.log("Client disconnected");
    },
  })
  .get("/health", ({ status }: Context) => {
    const info = {
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        redis: process.env.REDIS_HOST ? "enabled" : "disabled",
        s3: process.env.S3_BUCKET ? "enabled" : "disabled",
        database: process.env.DATABASE_NAME ? "enabled" : "disabled",
      },
    };
    return status(200, { info, success: true, message: "Service is healthy" });
  })

  .options("*", ({ status }) => status(204))
  .onError(({ set }) => {
    set.headers["Access-Control-Allow-Origin"] =
      process.env.ORIGIN_URL || "http://localhost:5173";
    set.headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  })

  // doing CORS' job! 🤦‍♂️
  // .onAfterHandle(({ request, set }) => {
  //   const origin = request.headers.get("origin");
  //   console.log(`onAfterHandle origin: ${origin}`);

  //   if (origin === process.env.ORIGIN_URL || origin === "http://localhost:3000") {
  //     set.headers["Access-Control-Allow-Origin"] = origin;
  //     set.headers["Access-Control-Allow-Methods"] =
  //       "GET, POST, PUT, PATCH, DELETE, OPTIONS";
  //     set.headers["Access-Control-Allow-Headers"] =
  //       "Content-Type, Authorization";
  //     set.headers["x-powered-by"] = "Simmons Multimedia";
  //   }
  // })

  // .onStart(systemBoot)
  .onStop(systemOff);

systemBoot().then(() => {
  app.listen({ port: PORT, development: ENV === "development" }, () => {
    console.log(
      `🦊 Backend running at ${app.server?.hostname}:${app.server?.port}`,
    );
  });
});
