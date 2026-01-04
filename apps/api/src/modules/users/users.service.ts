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

  /** CRON junction to thank users who've been activated for 24hrs
   *
   * @param userId
   */
  static async sendThankYouEmailAfter24hrs() {
    try {
      const users = await db.user.findMany({
        where: { emailVerified: true, banned: false, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      });

      for(const user of users) {
        const { email, name, banned, emailVerified, createdAt } = user;

        // if (banned || !emailVerified) { console.log(`User ${email} is banned or unverified`); return; }

        // if(createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        //   console.log(`User ${email} is not activated for 24 hours`);
        //   return;
        // }

        const subject = `${mono_config.app.name} | Thank you ${name.split(' ')[0]}!`;
        const html = `
          <h3>Hey there ${name.split(' ')[0]},</h3>
          <p>Thank you for joining the community!</p>
          <p>We hope you enjoy your time on <a href="${mono_config.app.url}">our App</a>. Remember you can <a href="${mono_config.app.github}/issues/new">report issues</a> or <a href="${mono_config.app.email}">give us feedback</a>.</p><br/>
          <p>Best regards,</p>
          <p>The ${mono_config.app.name} Team</p>
        `;

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