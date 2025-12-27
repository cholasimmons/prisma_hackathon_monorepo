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

const usersController = new Elysia({
  prefix: "/users",
})
  .mount(auth.handler)
  .use(betterAuth)
  .state({
    single: 'User',
    plural: 'Users'
  })

  .get("/", ({ store }) => store.plural)


  .get('/users', async ({ status, session }) => {
    const cached = await cache.get<PublicUser[]>(CacheKeys.user.all);
    if(cached) return status(200, { data: cached, success: true, message: "Cached Users retrieved" });

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

		if (!file) {
			throw new Error('No file provided');
		}

		// validate
		if (!file.type.startsWith('image/')) {
			throw new Error('Invalid file type');
		}

		// upload to MinIO / S3
		const update: {path:string} | null = await UserService.updateUserImage(session.userId, file);

		if(!update) {
			throw new Error('Failed to upload image');
		}

		const { path } = update;

		return status(200, { data: path, success:true, message: 'Image is uploading...' });
  }, {
    auth: true,
    body: t.Object({
      avatar: t.File({
        max: 1024 * 1024 * 5,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/jpg']
      })
    })
  });

export default usersController;
