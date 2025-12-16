import { Elysia, t } from "elysia";
import VehicleService from "./service";
import { betterAuth } from "~/middleware/betterauth";
import { cache } from "~/utils/cache";
import { strip } from "~/utils/strip";
import {
  PublicVehicle,
  PublicVehicleFields,
  PublicVehicleSubmission,
  PublicVehicleSubmissionFields,
} from "./model";
import { Vehicle, VehicleSubmission } from "@/generated/prisma/client";

const vehiclesController = new Elysia({
  prefix: "/vehicles",
})
  .use(betterAuth)

  // Get final vehicles
  .get(
    "/",
    async ({ status, query }) => {
      const vehicles = await VehicleService.searchVehicles({
        make: query.make,
        year: query.year ? query.year : undefined,
        limit: query.limit ? query.limit : 10,
        color: query.color,
        model: query.model ? query.model : undefined,
        plate: query.plate,
      });

      if (!vehicles) {
        return status(404, "No vehicles found");
      }

      // status(200);
      return status(200, {
        data: vehicles,
        message: `Successfully retrieved ${vehicles.length} vehicles`,
      });
    },
    {
      query: t.Object({
        make: t.Optional(t.String()),
        year: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        color: t.Optional(t.String()),
        model: t.Optional(t.String()),
        plate: t.Optional(t.String()),
      }),
    },
  )

  // Search my vehicle submissions
  .get(
    "/submissions",
    async ({ status, query, session }) => {
      const submissions: PublicVehicleSubmission[] | null =
        await VehicleService.searchSubmittedVehicles(
          {
            make: query.make,
            year: query.year ? query.year : undefined,
            limit: query.limit ? query.limit : 10,
          },
          session.userId,
        );

      if (!submissions) {
        return status(404, "No Vehicle submissions found");
      }

      return status(200, { data: submissions });
    },
    {
      query: t.Object({
        make: t.Optional(t.String()),
        year: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        color: t.Optional(t.String()),
      }),
      auth: true,
    },
  )

  // Get vehicle by ID
  .get(
    "/:id",
    async ({ status, params: { id }, set }) => {
      const vehicle: PublicVehicle | null =
        await VehicleService.getVehicleById(id);

      if (!vehicle) {
        return status(404, "Vehicle not found");
      }

      // Add cache headers for client-side caching
      set.headers["Cache-Control"] = "public, max-age=60";
      return status(200, vehicle);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  // Search final vehicles
  .get(
    "/search",
    async ({ status, query }) => {
      const vehicles = await VehicleService.searchVehicles({
        plate: query.plate,
        make: query.make,
        year: query.year ? query.year : undefined,
        limit: query.limit ? query.limit : 10,
      });

      if (!vehicles) {
        return status(404, "No vehicles found");
      }

      return status(200, {
        data: vehicles,
        message: `Found ${vehicles.length} vehicles`,
      });
    },
    {
      query: t.Object({
        plate: t.Optional(t.String()),
        make: t.Optional(t.String()),
        year: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric({ default: 10 })),
        color: t.Optional(t.String()),
      }),
    },
  )

  // POST

  .post(
    "/",
    async ({ body, status, session }) => {
      const submission = await VehicleService.submitVehicle(
        body,
        session.userId,
      );

      if (!submission) {
        return status(400, "Invalid vehicle submission");
      }

      return status(200, { success: true, data: submission });
    },
    {
      body: t.Object({
        plate: t.String({
          maxLength: 8,
          error: "Plate number seems to be too long",
        }),
        image: t.Optional(
          t.File({
            type: "image",
            maxSize: "3m",
          }),
        ),
        make: t.Optional(t.String()),
        model: t.Optional(t.String()),
        year: t.Optional(t.Numeric()),
        color: t.Optional(t.String()),
      }),
      auth: true,
    },
  )

  // Update vehicle
  .patch(
    "/:id",
    async ({ params: { id }, body, status }) => {
      const updated = await VehicleService.updateVehicle(id, body);

      if (!updated) {
        return status(404, "Vehicle not found");
      }

      return { success: true, vehicle: updated };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        make: t.Optional(t.String()),
        model: t.Optional(t.String()),
        year: t.Optional(t.Numeric()),
        image: t.Optional(
          t.File({
            type: "image/*",
            maxSize: 1024 * 1024 * 5,
            maxCount: 1,
            error: "Maximum image size 5MB",
          }),
        ),
      }),
    },
  )

  // Update vehicle image
  .post(
    "/image/:vehicleId",
    async ({
      params: { vehicleId },
      body: { image },
      status,
      session: { userId },
    }) => {
      console.log("image: ", image);

      const isMyVehicleSubmission: boolean =
        await VehicleService.isMyVehicleSubmission(vehicleId, userId);

      if (!isMyVehicleSubmission) {
        return status(403, "You are not authorized to update this vehicle");
      }

      const updated = await VehicleService.updateVehicleImage(
        vehicleId,
        image,
        userId,
      );

      if (!updated) {
        return status(404, "Unable to upload image");
      }

      return status(201, { success: true, data: updated });
    },
    {
      params: t.Object({
        vehicleId: t.String(),
      }),
      body: t.Object({
        image: t.File({
          maxSize: 1024 * 1024 * 3,
        }),
      }),
      auth: true,
    },
  )

  // Cache statistics endpoint (admin only)
  // .get("/cache/stats", async () => {
  //   return await cache.get();
  // })

  // Clear cache endpoint (admin only)
  .post("/cache/clear", async () => {
    await cache.invalidate(["vehicle:", "search:"]);
    return { success: true, message: "Vehicle cache cleared" };
  })

  .get("/health", ({ status }) => {
    status(200);
    return { success: true, message: "Vehicles service is healthy" };
  });

export default vehiclesController;
