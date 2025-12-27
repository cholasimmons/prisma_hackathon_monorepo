import { User } from "@/generated/prisma/client";
import { Elysia, t } from "elysia";
import { betterAuth } from "~/middleware/betterauth";
import { auth } from "~/utils/auth";
import { cache } from "~/utils/cache";
import { CacheKeys } from "~/utils/cache/keys";
import db from "~/utils/database/client";
import { strip } from "~/utils/strip";
import { PublicUser, PublicUserFields } from "./model";
import UserService from "./service";
import { BucketNames } from "~/utils/image/storage";
import s3 from "~/utils/s3";

const usersController = new Elysia({
  prefix: "/users",
})
  .mount(auth.handler)
  .use(betterAuth)
  .state({
    single: 'User',
    plural: 'Users'
  })

  .get('/', async ({ status, session }) => {
    const cached = await cache.get<PublicUser[]>(CacheKeys.user.all);
    if (cached) return status(200, { data: cached, success: true, message: "Cached Users retrieved" });

    const data: User[] | null = await db.user.findMany();
    if (!data) return status(404, { success: false, message: "Users not found" });

    const cleanUsers = strip(data, PublicUserFields);

    await cache.set<PublicUser[]>(CacheKeys.user.all, cleanUsers);

    return status(200, { data: cleanUsers, success: true, message: "Users retrieved" });
  }, {
    auth: true
  })

  .get("/health", ({ status, store }) => {
    const data = {
      module: store.plural,
      endpoint: `/${store.single}`,
      status: 'healthy'
    }
    return status(200, { data, success: true, message: `${store.single} service is healthy` });
  })


  .post('/avatar', async ({ status, body, session }) => {
    const file = body.avatar as File;

    console.log(body);

    if (!file) {
      throw new Error('No file provided');
    }

    // validate
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type');
    }

    // upload to MinIO / S3
    const update: { path: string } | null = await UserService.updateUserImage(session.userId, file);

    if (!update) {
      throw new Error('Failed to upload image');
    }

    const { path } = update;

    return status(200, { data: path, success: true, message: 'Image is uploading...' });
  }, {
    auth: true,
    body: t.Object({
      avatar: t.File({
        max: 1024 * 1024 * 5,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/jpg']
      })
    })
  })

  .post('/upload-test', async ({ status, body }) => {
    // Dummy content // Convert File to ArrayBuffer
    const content = `${new Date().toISOString()}: MinIO upload test - ${body.text ?? '.'}`;
    const buffer = Buffer.from(content);

    // Create unique filename
    const filepath = `${BucketNames.users}/debug-${Date.now()}`;

    // Upload to S3
    const s3File = s3.file(filepath);
    const uploadSizeB = await s3File.write(buffer, {
      type: "text/plain"
    });

    // GET URL for downloads
    const downloadUrl = s3File.presign({
      method: "GET",
      expiresIn: 60 * 60 * 24 // 1 day
    });

    return status(200, { data: downloadUrl, success: true, message: `${uploadSizeB * 1024}KB text file uploaded.` });
  }, {
    body: t.Object({
      text: t.Optional(t.String())
    }),
    detail: {
      tags: ['Debug', 'S3', 'upload', 'test'],
      description: 'Upload a text file to MinIO'
    }
  });

export default usersController;
