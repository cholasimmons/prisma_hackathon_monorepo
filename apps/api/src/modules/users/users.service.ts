import { User } from "@generated/prisma/client";
import { cache } from "~utils/cache";
import db from "~utils/database/client";
import { strip } from "~utils/strip";
import { CacheKeys } from "~utils/cache/keys";
import { BucketNames } from "~utils/image/storage";
import { PublicUser, PublicUserFields } from "./users.model";
import { addImageJob } from "~utils/queues/image";
import { addEmailJob } from "~utils/queues/email";
import mono_config from "@config";
import { renderEmail } from "~utils/email";

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

  static async verifyUser(userId: string) {
    try {
      await db.user.update({
        where: { id: userId },
        data: { verifiedAt: new Date() }
      });
    } catch (error) {
      console.error(`Failed to verify User ${userId}:`, error);
      throw error;
    }
  }

  /** CRON junction to thank users who've been activated for 24hrs
   *
   * @param userId
   */
  static async sendThankYouEmailAfter24hrs() {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const users = await db.user.findMany({
        where: { emailVerified: true, banned: false, verifiedAt: { lt: cutoff }, activationEmailSentAt: null }
      });

      for(const user of users) {
        const { email, name, banned, emailVerified, createdAt } = user;

        // if (banned || !emailVerified) { console.log(`User ${email} is banned or unverified`); return; }

        // if(createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        //   console.log(`User ${email} is not activated for 24 hours`);
        //   return;
        // }

        const firstname = name.split(' ')[0];
        const subject = `${mono_config.app.name} | Thank you ${firstname}!`;
        const html = await renderEmail('welcome', {
          name: firstname,
          appUrl: mono_config.app.url,
          appGithub: mono_config.app.github,
          appEmail: mono_config.app.email,
          appName: mono_config.app.name
        });

        // Send thank you email after 24 hours (CRON)
        await addEmailJob({ to: email, subject, html });

        console.log(
          `📧 Sent thank you email to ${email} (after 24 hours of being active).`
        );
      }


    } catch (error) {
      console.error(`Failed to send thank you emails`, error);
      throw error;
    }
  }
}

export default UserService;