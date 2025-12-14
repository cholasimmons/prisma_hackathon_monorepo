import {
  Logo,
  Prisma
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

    const logos: Logo[] | null = await db.logo.findMany({
      where,
    });

    if (!logos) {
      return null;
    }

    await cache.del(CacheKeys.logos.all);

    const cleanLogos: PublicLogo[] | null = strip(logos, PublicLogoFields);

    if (!cleanLogos) {
      return null;
    }

    await cache.set<PublicLogo[]>(CacheKeys.logos.all, cleanLogos, 6000);

    return cleanLogos;
  }

  static async getLogoByName(
    name: string,
    isAdmin: boolean = false,
  ): Promise<PublicLogo | null> {
    const lowercaseName = name.toLowerCase();

    // 1. Try cache first
    const cached = await cache.get<PublicLogo>(CacheKeys.logos.byName(lowercaseName));
    if (cached) {
      console.log(`✅ Cache HIT for ${name} logo`);
      return cached;
    }

    console.log(`❌ Cache MISS for ${name} logo`);

    const logo = await db.logo.findUnique({
      where: {
        name,
        isActive: isAdmin ? undefined : true,
      },
    });

    if (!logo) {
      return null;
    }

    const cleanLogo = strip(logo, PublicLogoFields);

    await cache.set<PublicLogo>(CacheKeys.logos.byName(lowercaseName), cleanLogo, 6000);
    return cleanLogo;
  }

  static async submitLogo(body: { name: string; image: File }, userId: string) {
    const { name, image } = body;

    try {
      const buffer = await image.arrayBuffer();
      const s = await sharp(buffer)
        .rotate()
        .resize({ width: 512 })
        .toFormat("webp", { quality: 80 })
        .toBuffer();
      const uploadSizeKb = (await s3.write(name, s)) * 1024;
      const pathName = nameFile(name, BucketNames.logos);

      console.log(`Uploaded ${uploadSizeKb}KB to ${pathName}`);

      const logo = await db.logo.create({
        data: {
          name,
          url: pathName,
          uploadSizeKb,
          submittedById: userId,
        },
      });

      if(!logo) {
        throw new Error('Logo not created');
      }

      const cleanLogo = strip(logo, PublicLogoFields);

      if(!cleanLogo) {
        throw new Error('Logo not stripped');
      }

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
    body: { name: string; image?: File },
    userId: string,
  ) {
    const { name, image } = body;
    // const fname = name ?? Date.now().toLocaleString();

    try {
      if (image) {
        const buffer = await image.arrayBuffer();
        const s = await sharp(buffer)
          .rotate()
          .resize({ width: 1280 })
          .toFormat("webp")
          .toBuffer();
        const uploadSizeKb = (await s3.write(name, s)) * 1024;
        const fileName = nameFile(name, BucketNames.logos);

        console.log(`Re-Uploaded ${uploadSizeKb}KB to ${fileName}`);

        const updated: Logo | null = await db.logo.upsert({
          where: {
            id,
          },
          create: {
            name: name,
            url: fileName,
            uploadSizeKb,
            submittedById: userId,
          },
          update: {
            name: name,
            url: fileName,
            uploadSizeKb,
            submittedById: userId,
          },
        });

        if(!updated) {
          throw new Error('Logo not found');
        }

        const logo = strip(updated, PublicLogoFields);

        await cache.set<PublicLogo>(CacheKeys.logos.byName(name), logo, 4000);

        return { logo, success: true };
      }
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
