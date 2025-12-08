import { checkEnvVariables } from "~/utils/system/env-checker";
import prisma from "../prisma";
import { cache } from "~/utils/cache/index";

const requiredEnvVars = [
  // Database Variables
  "DATABASE_URL",
  // "DATABASE_USER",
  // "DATABASE_PASSWORD",
  // "DATABASE_NAME",
  // "DATABASE_PORT", // Optional: Can have a default
  // "DATABASE_HOST", // Optional: Often 'localhost'
  "NODE_ENV",
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
      console.info(`| Checking environment variables (${process.env.NODE_ENV})...`);
      checkEnvVariables(requiredEnvVars);
      setTimeout(() => {
        return resolve();
      }, 1000);
    });

    console.info("| Checking database connection (Postgres)...");
    await prisma.$connect();
    console.log("| ✅");

    console.info("| Checking cache connection (Redis)...");
    const redisConnected = cache.connect(); // ("system:booted", "true");
    if(redisConnected === true) {
      console.log("| ✅");
    } else {
      console.error("| ✖️");
    }

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

    await prisma.$disconnect();
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
