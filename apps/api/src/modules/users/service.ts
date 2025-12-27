import { Prisma, User } from "@/generated/prisma/client";
import { cache } from "~/utils/cache";
import db from "~/utils/database/client";
import { strip } from "~/utils/strip";
import { CacheKeys } from "~/utils/cache/keys";
import { BucketNames } from "~/utils/image/storage";
import s3 from "~/utils/s3";
import { PublicUser, PublicUserFields } from "./model";
import sharp from "sharp";
import { addImageJob } from "~/utils/queues/image";
import { imageQueue } from "~/utils/queues";

abstract class UserService {

  /**
   * Update User image
   */
  static async updateUserImage(
    userId: string,
    image: File,
  ): Promise<{path:string} | null> {
    // 1. Upload image in S3
    const { path } = await UserService.handleImageUpload(
      userId,
      image,
    );

    // 2: Update database
    const updatedUser: User | null =
      await db.user.update({
        where: { id: userId },
        data: {
          image: path,
        }
      });

    if (!updatedUser) {
      return null;
    }

    // 2. Invalidate relevant cache entries
    await cache.invalidate([
      CacheKeys.user.byId(userId),
    ]);

    console.log(
      `🔄 Updated User image (${userId}) and invalidated cache`,
    );
    const updatedStripped = strip(
      updatedUser,
      PublicUserFields,
    );

    if (!updatedStripped) {
      return null;
    }

    await cache.set<PublicUser>(
      CacheKeys.user.byId(userId),
      updatedStripped,
    );

    return { path };
  }


  private static async handleImageUpload(
    userId: string,
    imageFile: File,
  ): Promise<{ path: string }> {
    try {

      // Create unique filename
      const extension = imageFile.name.split(".").pop() || "jpg";
      const filepath = `${BucketNames.users}/${userId}/avatar-${Date.now()}.${extension}`;

      await addImageJob(userId, imageFile, filepath, extension);

      console.log(
        `📸 Uploading optimized image for User ${userId} to S3: ${filepath}.`
      );

      return { path: filepath };
    } catch (error) {
      console.error(`Failed to upload image for User ${userId}:`, error);
      throw error;
    }
  }
}

export default UserService;
