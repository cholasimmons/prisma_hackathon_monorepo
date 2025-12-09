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
} from "~/modules/index";

const PORT = Number(process.env.PORT) || 3000;

const root = new Elysia({
  websocket: {
    idleTimeout: 30,
  },
  normalize: "typebox",
})
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    }),
  )
  .use(
    cors({
      origin: (req) => {
        const origin = req.headers.get("origin");
        if (!origin) return false; // server-to-server requests

        if (process.env.NODE_ENV === "production") {
          return /https:\/\/(.*\.)?simmons\.studio$/.test(origin);
        } else {
          // allow localhost dev
          return origin === "http://localhost:5173";
        }
      },
      aot: false,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }).as("global"),
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
      run: () => console.log("Cron job executed (5 minutes"),
    }),
  )
  .use(betterAuth)
  .use(authController)
  .use(vehiclesController)
  .use(fileController)

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
      timestamp: new Date().toISOString(),
      services: {
        redis: process.env.REDIS_HOST ? "enabled" : "disabled",
        s3: process.env.S3_BUCKET ? "enabled" : "disabled",
        database: process.env.DATABASE_NAME ? "enabled" : "disabled",
      },
    };
    status(200);
    return { data: info, success: true, message: "Root service is healthy" };
  })

  // .onStart(systemBoot)
  .onStop(systemOff);

systemBoot().then(() => {
  root.listen(PORT, () => {
    console.log(
      `🦊 Backend running at ${root.server?.hostname}:${root.server?.port}`,
    );
  });
});
