import { Elysia, t } from "elysia";
import LogoService from "./service";
import { betterAuth } from "~middleware/betterauth";

const logosController = new Elysia({
  prefix: "/logos",
})

  .use(betterAuth)

  .group("/admin", (secure) =>
    secure
      .post(
        "/",
        async ({ body, status, session }) => {
          const logo = await LogoService.submitLogo(body, session.userId);

          if (!logo) {
            return status(400, "Invalid logo submission");
          }

          status(201);
          return { success: true, data: logo };
        },
        {
          body: t.Object({
            image: t.File({
              maxSize: 1024 * 1024 * 5,
              format: "image/*",
              error: "Image size exceeds limit",
            }),
            name: t.String(),
          }),
          auth: true,
        },
      )

      // Update vehicle
      .patch(
        "/:id",
        async ({ params: { id }, body, status, session }) => {
          const updated = await LogoService.updateLogo(id, body, session.userId);

          if (!updated) {
            return status(404, "Logo not patched");
          }

          status(200);
          return { success: true, logo: updated };
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            name: t.String(),
            image: t.Optional(
              t.File({
                type: "image/*",
                maxSize: 1024 * 1024 * 5,
                error: "Maximum image size 5MB",
              }),
            ),
          }),
          auth: true
        }),
  )

  // Get all logos
  .get("/", async ({ status }) => {
    const logos = await LogoService.fetchLogos();

    if(!logos) {
      console.error("❌ Failed to fetch logos");
      return status(404, "Could not fetch logos");
    }

    return status(200, { data: logos, message: `Fetched ${logos.length} logos` });
  })

  .get(
    "/:name",
    async ({ status, params }) => {
      const logo = await LogoService.getLogoByName(params.name);

      if(!logo) {
        console.error("❌ Failed to fetch logo");
        return status(404, "Could not fetch logo");
      }

      return status(200, logo);
      // return { data: logo };
    },
    {
      params: t.Object({
        name: t.String(),
      }),
    },
  )

  .get("/health", ({ status }) => {
    return status(200, { success: true, message: "Logo service is healthy" });
    // return { success: true, message: "Logo service is healthy" };
  });

export default logosController;
