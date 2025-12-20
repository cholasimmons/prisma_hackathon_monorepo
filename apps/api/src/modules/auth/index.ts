import { Elysia } from "elysia";
import { auth } from "~/utils/auth";

const authController = new Elysia({
  prefix: "/auth",
})
  .mount(auth.handler)

  .get("/", () => "Auth")
  .get("/health", ({ status }) => {
    const data = {
      module: "Auth",
      endpoint: "/auth",

    }
    return status(200, { data, success: true, message: "Auth service is healthy" });
  });

export default authController;
