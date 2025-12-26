import { User } from "@/generated/prisma/client";
import { Elysia } from "elysia";
import { betterAuth } from "~/middleware/betterauth";
import { auth } from "~/utils/auth";
import { cache } from "~/utils/cache";
import { CacheKeys } from "~/utils/cache/keys";
import db from "~/utils/database/client";
import { strip } from "~/utils/strip";
import { PublicUser, PublicUserFields } from "./model";

const authController = new Elysia({
  prefix: "/auth",
})
  .mount(auth.handler)
  .use(betterAuth)

  .get("/", () => "Auth")

  .get("/me", async ({ status, session }) => {
    const cached = await cache.get<PublicUser>(CacheKeys.user.byId(session.userId));
    if(cached) return status(200, { data: cached, success: true, message: "Cached User retrieved" });

    const data: User | null = await db.user.findUnique({
      where: {
        id: session.userId,
      },
    });
    if (!data) return status(404, { success: false, message: "User not found" });

    const cleanUser = strip(data, PublicUserFields);

    await cache.set<PublicUser>(CacheKeys.user.byId(session.userId), cleanUser);

    return status(200, { data: cleanUser, success: true, message: "User retrieved" });
  }, {
    auth: true
  })

  .get("/health", ({ status }) => {
    const data = {
      module: "Auth",
      endpoint: "/auth",

    }
    return status(200, { data, success: true, message: "Auth service is healthy" });
  });

export default authController;
