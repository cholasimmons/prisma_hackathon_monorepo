import { User } from "@/generated/prisma/client";
import { cache } from "~/utils/cache";
import db from "~/utils/database/client";
import { strip } from "~/utils/strip";
import { CacheKeys } from "~/utils/cache/keys";
import { BucketNames } from "~/utils/image/storage";
import { PublicUser, PublicUserFields } from "./model";
import { addImageJob } from "~/utils/queues/image";
import s3 from "~/utils/s3";

abstract class UserService {

  /**
   * Update User image
   */
  static async updateUserImage(
    userId: string,
    image: File,
  ): Promise<string | null> {
    // 1. Upload image in S3
    const path = await UserService.handleImageUpload(
      userId,
      image,
    );

    // let presignedUrl: string | null = null;
    // if(path) {
    //   // Generate presigned URL (expires in 1 hour)
    //   presignedUrl = s3.presign(
    //     path, {
    //       method: 'GET',
    //       expiresIn: 86400, // 1 day
    //     }
    //   );
    // }

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

    return path ?? null;
  }


  private static async handleImageUpload(
    userId: string,
    imageFile: File,
  ): Promise<string> {
    try {
      console.log('handleImageUpload() started...')

      // Create unique filename
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const safeFilename = `avatar-${Date.now()}`;
      const filepath = `${BucketNames.users}/${userId}/${safeFilename}.${ext}`;
      const tmpDir =
        Bun.env.TMPDIR ??
        Bun.env.TEMP ??
        Bun.env.TMP ??
        '/tmp';

      // 1. Save file to temp disk (or direct S3 raw upload)
      const tempPath = `${tmpDir}/${crypto.randomUUID()}.${ext}`;
      await Bun.write(tempPath, (await imageFile.arrayBuffer()));

      await addImageJob(userId, tempPath, filepath, ext);

      console.log(
        `📸 Uploading optimized image for User ${userId} to S3: ${filepath}.`
      );

      return filepath;
    } catch (error) {
      console.error(`Failed to upload image for User ${userId}:`, error);
      throw error;
    }
  }
}

export default UserService;
