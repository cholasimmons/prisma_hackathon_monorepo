import {
  Logo,
  Prisma,
  Vehicle,
  VehicleSubmission,
} from "@/generated/prisma/client";
import { cache } from "~/utils/cache";
import db from "~/utils/database/client";
import s3 from "~/utils/s3";
import { strip } from "~/utils/strip";
import { PublicLogoFields, type PublicLogo } from "./model";
import { CacheKeys } from "~/utils/cache/keys";
import sharp from "sharp";
import { BucketNames, nameFile } from "~/utils/image/storage";

abstract class LogoService {
  static async fetchLogos(
    isAdmin: boolean = false,
  ): Promise<PublicLogo[] | null> {
    const where: Prisma.LogoWhereInput = {};

    where.isActive = isAdmin ? undefined : true;

    const logos = await db.logo.findMany({
      where,
    });

    if (!logos) {
      return null;
    }

    return strip(logos, PublicLogoFields);
  }

  static async getLogoByName(
    name: string,
    isActive: boolean = true,
  ): Promise<PublicLogo | null> {
    // 1. Try cache first
    const cached = await cache.get<PublicLogo>(CacheKeys.logos.byName(name));
    if (cached) {
      console.log(`✅ Cache HIT for ${name} logo`);
      return cached;
    }

    console.log(`❌ Cache MISS for ${name} logo`);

    const logo = await db.logo.findUnique({
      where: {
        name,
        isActive,
      },
    });

    if (!logo) {
      return null;
    }

    const cleanLogo = strip(logo, PublicLogoFields);

    await cache.set<PublicLogo>(CacheKeys.logos.byName(name), cleanLogo, 6000);
    return cleanLogo;
  }

  static async submitLogo(body: { name: string; image: File }, userId: string) {
    const { name, image } = body;

    try {
      const buffer = await image.arrayBuffer();
      const s = await sharp(buffer)
        .rotate()
        .resize({ width: 1280 })
        .toFormat("webp")
        .toBuffer();
      const uploadSizeKb = (await s3.write(name, s)) * 1024;
      const fileName = nameFile(name, BucketNames.logos);

      console.log(`Uploaded ${uploadSizeKb}KB to ${fileName}`);

      const logo = await db.logo.create({
        data: {
          name,
          url: fileName,
          uploadSizeKb,
          submitedById: userId,
        },
      });

      const cleanLogo = strip(logo, PublicLogoFields);
      await cache.set<PublicLogo>(
        CacheKeys.logos.byName(name),
        cleanLogo,
        6000,
      );

      return cleanLogo;
    } catch (error) {
      console.error(`Error submitting logo: ${error}`);
      if (error instanceof Error) {
        throw error.message;
      }
      throw error;
    }
  }

  static async updateLogo(
    id: string,
    body: { name: string; image: File },
    userId: string,
  ) {
    const { name, image } = body;

    try {
      const buffer = await image.arrayBuffer();
      const s = await sharp(buffer)
        .rotate()
        .resize({ width: 1280 })
        .toFormat("webp")
        .toBuffer();
      const uploadSizeKb = (await s3.write(name, s)) * 1024;
      const fileName = nameFile(name, BucketNames.logos);

      console.log(`Re-Uploaded ${uploadSizeKb}KB to ${fileName}`);

      const updated = await db.logo.update({
        where: {
          id,
        },
        data: {
          name,
          url: fileName,
          uploadSizeKb,
          submitedById: userId,
        },
      });

      const logo = strip(updated, PublicLogoFields);

      await cache.set<PublicLogo>(CacheKeys.logos.byName(name), logo, 4000);

      return { success: true, logo };
    } catch (error) {
      console.error(`Error updating logo: ${error}`);
      if (error instanceof Error) {
        throw error.message;
      }
      throw error;
    }
  }
}

export default LogoService;
