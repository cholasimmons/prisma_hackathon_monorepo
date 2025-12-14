import { Elysia } from "elysia";
import { auth } from "~/utils/auth";

// user middleware (compute user and session and pass to routes)
const betterAuth = new Elysia({ name: "better-auth" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) return status(401, "You must be logged in");

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
}).as('global');

export { betterAuth };
