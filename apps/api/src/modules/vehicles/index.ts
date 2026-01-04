import { Elysia, t } from "elysia";
import VehicleService from "./vehicle.service";
import { betterAuth } from "~middleware/betterauth";
import { cache } from "~utils/cache";
import {
  PublicVehicle,
  PublicVehicleSubmission,
} from "./vehicle.model";
import { KNOWN_MAKES } from "~utils/vehicles";
import { audit } from "~services/audit";
import { EventType } from "@generated/prisma/enums";
import { ip } from "elysia-ip";
import cron, { Patterns } from "@elysiajs/cron";

const vehiclesController = new Elysia({
  prefix: "/vehicles",
})
  .use(betterAuth)
  .state({
    single: 'Vehicle',
    plural: 'Vehicles'
  })
  .use(ip())
  .use(cron({
    name: "vehicle-cron-job",
    pattern: Patterns.EVERY_HOUR,
    run: () => {
      //console.log("Vehicle Cron Job executed (Daily @ 5AM)");
      console.log("Vehicle Cron Job executed (Hourly)");
      VehicleService.runVehicleConsensus();
    },
  }))

  .group('/admin', (secure) => secure
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
        }, true);
      }, {
        query: t.Object({
          make: t.Optional(t.String()),
          year: t.Optional(t.Numeric()),
          limit: t.Optional(t.Numeric()),
          color: t.Optional(t.String()),
          model: t.Optional(t.String()),
          plate: t.Optional(t.String()),
        }),
      }
    )
  )

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
        limit: t.Optional(t.Numeric({ default: 20 })),
        color: t.Optional(t.String()),
      }),
      auth: true,
    },
  )

  // Get vehicle by ID
  .get(
    "/:plate",
    async ({ status, params: { plate }, set }) => {
      console.log("param plate:", plate);
      console.log("decoded param plate:", decodeURIComponent(plate));

      const vehicle: PublicVehicle | null =
        await VehicleService.getVehicleByPlate(plate, true);

      if (!vehicle) {
        return status(404, "Vehicle not found");
      }

      // Add cache headers for client-side caching
      set.headers["Cache-Control"] = "public, max-age=60";
      return status(200, { data: vehicle, message: plate+' found', success: true });
    },
    {
      params: t.Object({
        plate: t.String(),
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

  .get('/vehicles/suggest-make', async ({ status, query }) => {
    const suggestions = KNOWN_MAKES
      .filter(make =>
        make.toLowerCase().includes(query.make.toLowerCase())
      )
      .slice(0, 5);

    return status(200, {
      data: suggestions,
      message: `Found ${suggestions.length} suggestions`,
    });
  }, {
    query: t.Object({
      make: t.String()
    })
  })

  // POST

  .post(
    "/",
    async ({ body, status, session, request, ip }) => {
      console.log(session.userId + "attempting to upload" + body);

      const submission = await VehicleService.submitVehicle(
        body,
        session.userId,
      );

      if (!submission) {
        return status(400, "Invalid vehicle submission");
      }

      await audit.log({
        actorId: session.userId,
        type: EventType.SUBMISSION_CREATE,
        entity: "VehicleSubmission",
        entityId: submission.id,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') ?? undefined,
        route: request.url,
        method: request.method,
      });

      return status(201, { success: true, data: submission, message: "Vehicle submitted." });
    },
    {
      body: t.Object({
        plate: t.String({
          maxLength: 10,
          error: "Plate number cannot exceed 10 characters",
        }),
        images: t.Optional(
            t.Files({
              type: "image",
              maxSize: "5m",
            }),
        ),
        make: t.String(),
        model: t.Optional(t.String()),
        year: t.Optional(t.Numeric()),
        color: t.Optional(t.String()),
        type: t.Optional(t.String()),
        forSale: t.Optional(t.BooleanString())
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
