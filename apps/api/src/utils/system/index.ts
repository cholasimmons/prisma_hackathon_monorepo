import { checkEnvVariables } from "~/utils/system/env-checker";
import db from "~/utils/database/client";
import { cache } from "~/utils/cache/index";
import { mailer, sendMail } from "../mailer";

const requiredEnvVars = [
  "ORIGIN_URL",
  // Database Variables
  "DATABASE_URL",
  // "DATABASE_USER",
  // "DATABASE_PASSWORD",
  // "DATABASE_NAME",
  // "DATABASE_PORT", // Optional: Can have a default
  // "DATABASE_HOST", // Optional: Often 'localhost'
  "NODE_ENV",
  "BUN_ENV",
  "PORT",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_BUCKET",
  "REDIS_USER",
  "REDIS_PASSWORD",
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_URL",
];

const systemBoot = async () => {
  console.log("System booting...");

  try {
    // List all required environment variables
    await new Promise<void>((resolve) => {
      console.info(
        `| Checking environment variables (${process.env.NODE_ENV})...`,
      );
      checkEnvVariables(requiredEnvVars);
      setTimeout(() => {
        return resolve();
      }, 1000);
    });

    console.info("| Checking database connection (Postgres)...");
    await db.$connect();
    console.log("| ✅ Prisma + Postgres");

    console.info("| Checking cache connection (Redis)...");
    const redisConnected = cache.connect(); // ("system:booted", "true");
    if (redisConnected === true) {
      console.log("| ✅ Redis");
    } else {
      console.error("| ✖️ Redis");
    }

    console.info("| Checking Email transport (Nodemailer)...");
    await mailer.verify();
    // await sendMail(["frank@simmons.studio"], "Prisma API System Booted", null, `<b>Prisma API</b> System booted successfully.`);
    console.log("| ✅ Nodemailer");

    // console.log("👍🏼 System booted.");
  } catch (e) {
    console.error("⚠️ System failed to boot.", e);
    process.exit(1);
  }
};

const systemOff = async () => {
  console.log("System Shutting down...");

  try {
    // List all required environment variables
    // await s3
    // console.info("| Bucket storage offline.");

    await db.$disconnect();
    console.info("| Database offline.");

    cache.close();
    console.info("| Cache layer offline.");

    console.info("| System ready to shutdown.");
  } catch (e) {
    console.error("System failed to stop properly.", e);
    process.exit(1);
  }
};

export { systemBoot, systemOff };
