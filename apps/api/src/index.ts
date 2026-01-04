import { Context, Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { OpenAPI } from "~utils/auth";
import { betterAuth } from "~middleware/betterauth";
import cron, { Patterns } from "@elysiajs/cron";
import { helmet } from "elysia-helmet";
import { ip } from "elysia-ip";
import { rateLimit } from "elysia-rate-limit";
import { systemBoot, systemOff } from "~utils/system";
import { logger } from '@grotto/logysia';
import {
  authController,
  usersController,
  vehiclesController,
  fileController,
  logosController,
  auditController
} from "~modules/index";
import staticPlugin from "@elysiajs/static";
import db from "~utils/database/client";
import { cache } from "~utils/cache";
import { addEmailJob } from "~utils/queues/email";
import { audit } from "~services/audit";
import { EventType } from "@generated/prisma/enums";
import VehicleService from "~modules/vehicles/vehicle.service";
import mono_config from '@config';

// Useful constants
const PORT = Number(process.env.PORT || 3000);
const ENV = process.env.BUN_ENV ?? process.env.NODE_ENV;
const allowedOrigins = process.env.ORIGIN_URL?.split(',')
  // const unsafePlugins = new Elysia()
  //   .use(elysiaXSS({}))
  //   .use(Logestic.preset("commontz"));

const app = new Elysia({
  websocket: {
    idleTimeout: 30,
  },
  name: mono_config.app.name,
  detail: {
    description: mono_config.app.description
  },
  normalize: "typebox",
})
  .use(
    cors({
      origin: process.env.NODE_ENV === 'production' ? allowedOrigins : ["http://localhost:3001"],
      aot: false,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "content-type",
        "authorization",
        "credentials",
        "x-client-plate-normalized",
      ],
      credentials: true,
      maxAge: 60 * 60 * 24,
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
  // .use(elysiaXSS({}))
  .use(ip())
  // .use(Logestic.preset("commontz") as any)
  .use(logger({
      logIP: true,
      writer: {
          write(msg: string) {
            console.log(msg)
          }
      }
  }))
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
      pattern: Patterns.EVERY_30_MINUTES,
      run: () => console.log("Main Cron Job executed (30 minutes)"),
    }),
  )
  .use(staticPlugin({ indexHTML: false }))
  .use(betterAuth)
  .use(authController)
  .use(usersController)
  .use(vehiclesController)
  .use(fileController)
  .use(logosController)
  .use(auditController)

  .get("/", () => "Hello you sneaky Car Lover")

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

  .get("/stats", async ({ status, session }:any) => {
      const cached = await cache.get("stats");
      if(cached)
        return status(200, { data: cached, success: true, message: "Cached Stats fetched successfully" });

      const users = await db.user.count();
      const vehicles = await db.vehicle.count();
      const submissions = await db.vehicleSubmission.count();
      const photos = await db.vehiclePhoto.count();

      const data = {
        users,
        vehicles,
        submissions,
        photos,
      };

      await cache.set("stats", data, 60 * 60 * 6);

      return status(200, { data, success: true, message: "Stats fetched successfully" });
  }, {
    auth: true
  })

  .post("/test-email", async ({ body, status, ip, session }) => {
    const { to, subject, html } = body;

    // Job Queue
    await addEmailJob({ to, subject , html });

    // Audit Log
    await audit.log({ actorId: "SYSTEM", type: EventType.EMAIL_SEND, entity: 'Email', entityId: '000', ipAddress: ip, userAgent: 'User Agent', route: '/test-email', method: 'POST' });

    return status(200, { success: true, message: "Email sent successfully" });
  }, {
    auth: true,
    body: t.Object({
      to: t.String(),
      subject: t.String({ default: 'Test Email from Backend Server'}),
      html: t.String()
    })
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
  .onStop(systemOff);

systemBoot().then(() => {
  app.listen({ port: PORT, development: ENV === "development" }, () => {
    console.log(
      `🦊 Backend running at ${app.server?.hostname}:${app.server?.port}`,
    );
  });
});
