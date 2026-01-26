import {
  Prisma,
  UploadStatus,
  Vehicle,
  VehicleSubmission,
  VehicleType,
} from "@generated/prisma/client";
import { cache } from "~utils/cache";
import db from "~utils/database/client";
import { strip } from "~utils/strip";
import {
  PublicVehicleFields,
  PublicVehicleSubmissionFields,
} from "./vehicle.model";
import type {
  ConsensusResult,
  PublicVehicle,
  PublicVehicleSubmission,
} from "./vehicle.model";
import { CacheKeys } from "~utils/cache/keys";
import { VehicleSubmissionCreateInput } from "@generated/prisma/models";
import { BucketNames } from "~utils/image/storage";
import { normalizeMake } from "~utils/vehicles";
import {
  addVehicleSubmissionImageUploadJob,
  addVehicleSubmissionJob,
} from "~utils/queues/vehicle";
import { addImageJob } from "~utils/queues/image";
import {
  majorityVote,
  resolveRequired,
  computeOverallConfidence,
} from "~utils/vehicles/majorityResolver";

const MIN_SUBMISSIONS_FOR_PUBLIC =
  Number(process.env.MIN_SUBMISSIONS_FOR_PUBLIC) ?? 2;
const MIN_FIELD_CONFIDENCE = Number(process.env.MIN_FIELD_CONFIDENCE) ?? 0.6;

abstract class VehicleService {
  static async searchVehicles(
    params: {
      make?: string;
      year?: number;
      limit?: number;
      color?: string;
      model?: string;
      type?: VehicleType;
      forSale?: boolean;
      plate?: string;
    },
    isAdmin: boolean = false,
  ): Promise<PublicVehicle[] | null> {
    const { make, year, limit, color, model, plate, type, forSale } = params;
    const where: Prisma.VehicleWhereInput = {};

    if (make) where.make = make;
    if (typeof year === "number") where.year = year;
    if (color?.trim())
      where.color = { contains: color.trim(), mode: "insensitive" };
    if (model?.trim())
      where.model = { contains: model.trim(), mode: "insensitive" };
    if (type) where.type = type;
    if (typeof forSale === "boolean") where.forSale = forSale;
    if (plate?.trim())
      where.plate = { contains: plate.trim(), mode: "insensitive" };
    where.submissionCount = { not: 0, gte: MIN_SUBMISSIONS_FOR_PUBLIC };

    if (!isAdmin) {
      where.isActive = true;
    }

    // 1. Try cache first
    const cached = await cache.get<PublicVehicle[]>(
      CacheKeys.vehicles.allQueried(JSON.stringify(params)),
    );
    if (cached) {
      console.log(`✅ Cache HIT for vehicle search ${JSON.stringify(params)}`);
      return cached;
    }

    const vehicles: Vehicle[] | null = await db.vehicle.findMany({
      where,
      take: limit,
    });

    if (!vehicles) {
      console.error("❌ Failed to fetch vehicles");
      return null;
    }

    const cleanVehicles = strip(vehicles, PublicVehicleFields);

    cache.set<PublicVehicle[]>(
      CacheKeys.vehicles.allQueried(JSON.stringify(params)),
      cleanVehicles,
      60 * 60, // 1 hour
    );

    return cleanVehicles;
  }

  static async searchSubmittedVehicles(
    params: {
      make?: string;
      model?: string;
      year?: number;
      limit?: number;
      color?: string;
      type?: VehicleType;
      forSale?: boolean;
      plate?: string;
    },
    userId: string,
  ): Promise<PublicVehicleSubmission[] | null> {
    const { make, model, year, limit, color, type, forSale, plate } = params;
    const where: Prisma.VehicleSubmissionWhereInput = {};

    if (make) where.make = make;
    if (typeof year === "number") where.year = year;
    if (color?.trim())
      where.color = { contains: color.trim(), mode: "insensitive" };
    if (model?.trim())
      where.model = { contains: model.trim(), mode: "insensitive" };
    if (type) where.type = type;
    if (typeof forSale === "boolean") where.forSale = forSale;
    if (plate?.trim())
      where.plate = { contains: plate.trim(), mode: "insensitive" };
    where.submittedById = userId;

    const submissions = await db.vehicleSubmission.findMany({
      where,
      include: { photos: true },
      take: limit || 20,
    });

    if (!submissions) {
      console.error("❌ Failed to fetch submissions");
      return null;
    }

    const cleanSubmissions = strip(submissions, PublicVehicleSubmissionFields);

    return cleanSubmissions;
  }

  static async getVehicleById(
    id: string,
    isActive: boolean = true,
  ): Promise<PublicVehicle | null> {
    // 1. Try cache first
    const cached = await cache.get<PublicVehicle>(CacheKeys.vehicles.byId(id));
    if (cached) {
      console.log(`✅ Cache HIT for vehicle ${id}`);
      return cached;
    }

    console.log(`❌ Cache MISS for vehicle ${id}`);

    const vehicle = await db.vehicle.findUnique({
      where: { id, isActive },
    });

    if (!vehicle) {
      return null;
    }

    const cleanVehicle = strip(vehicle, PublicVehicleFields);

    await cache.set<PublicVehicle>(
      CacheKeys.vehicles.byId(id),
      cleanVehicle,
      600,
    );
    return vehicle;
  }

  static async getVehicleByPlate(
    plate: string,
    isActive?: boolean,
  ): Promise<PublicVehicle | null> {
    // 1. Try cache first
    const cached = await cache.get<PublicVehicle>(
      CacheKeys.vehicles.byPlate(plate),
    );
    if (cached) {
      console.log(`✅ Cache HIT for vehicle ${plate}`);
      return cached;
    }

    console.log(`❌ Cache MISS for vehicle ${plate}`);

    const vehicle = await db.vehicle.findUnique({
      where: { plate, isActive },
    });

    if (!vehicle) {
      return null;
    }

    const cleanVehicle = strip(vehicle, PublicVehicleFields);

    await cache.set<PublicVehicle>(
      CacheKeys.vehicles.byPlate(plate),
      cleanVehicle,
      60 * 10, // 10 minutes
    );
    return vehicle;
  }

  /** Fetches all Vehicle Submissions
   * @returns VehicleSubmissions[]
   */
  static async getSubmissionsByPlate(
    plate: string,
    isActive: boolean | undefined | null = true,
  ): Promise<VehicleSubmission[] | null> {
    // 1. Try cache first
    const cached = await cache.get<VehicleSubmission[]>(
      CacheKeys.vehicles.submissions.allByPlate(plate),
    );
    if (cached) {
      console.log(`✅ Cache HIT for vehicle submissions: ${plate}`);
      return cached;
    }

    console.log(`❌ Cache MISS for vehicle submissions: ${plate}`);

    const submissions = await db.vehicleSubmission.findMany({
      where: { plate, isActive: isActive || undefined },
    });

    if (!submissions) {
      return null;
    }

    // const cleanVehicle = strip(vehicle, PublicVehicleFields);

    await cache.set<VehicleSubmission[]>(
      CacheKeys.vehicles.submissions.allByPlate(plate),
      submissions,
      60 * 60, // 1 hour
    );
    return submissions;
  }

  /**
   * Get vehicle with image URL
   */
  static async getVehicleWithImage(
    plate: string,
  ): Promise<(PublicVehicle & { photoUrl?: string }) | null> {
    const vehicle = await this.getVehicleByPlate(plate);

    if (!vehicle) {
      return null;
    }

    // Generate presigned URL for the image if it exists in S3
    // if (vehicle.photos) {
    //   try {
    //     // Generate a URL valid for 1 hour
    //     const imageUrl = s3.presign(vehicle.photo, {
    //       expiresIn: 3600,
    //       method: "GET",
    //     });

    //     return {
    //       ...vehicle,
    //       photo: imageUrl,
    //     };
    //   } catch (error) {
    //     console.warn(`Failed to generate image URL for vehicle ${id}:`, error);
    //     // Return vehicle without image URL if S3 fails
    //     return vehicle;
    //   }
    // }

    return vehicle;
  }

  /**
   * Update vehicle with cache invalidation
   */
  static async updateVehicle(
    userId: string,
    id: string,
    updates: Partial<Vehicle> & { image?: File },
  ): Promise<PublicVehicle | null> {
    // 1. Update in database
    const updatedVehicle: Vehicle | null = await db.vehicle.update({
      where: { id, isActive: true },
      data: updates,
    });

    if (!updatedVehicle) {
      return null;
    }

    // 2. Invalidate relevant cache entries
    await cache.invalidate([CacheKeys.vehicles.byId(id)]);

    // 3. If there's an image upload, handle it
    if (updates.image) {
      await VehicleService.handleVehicleImage("", id, updates.image);
      // Remove the temporary imageFile property
      delete (updatedVehicle as any).photo;
    }

    console.log(`🔄 Updated vehicle ${id} and invalidated cache`);
    const updatedStripped = strip(updatedVehicle, PublicVehicleFields);
    await cache.set<PublicVehicle>(
      CacheKeys.vehicles.byId(id),
      updatedStripped,
    );

    return updatedStripped;
  }

  /**
   * Update/Create vehicle with cache invalidation
   */
  static async upsertVehicleByPlate(
    plate: string,
    updates: Partial<Vehicle> & { image?: File },
  ): Promise<PublicVehicle | null> {
    // 1. Update in database
    const updatedVehicle: Vehicle | null = await db.vehicle.update({
      where: { plate },
      data: updates,
    });

    if (!updatedVehicle) {
      return null;
    }

    // 2. Invalidate relevant cache entries
    await cache.invalidate([CacheKeys.vehicles.byPlate(plate)]);

    // 3. If there's an image upload, handle it
    // if (updates.image) {
    //   await VehicleService.handleVehicleImage(id, updates.image);
    //   // Remove the temporary imageFile property
    //   delete (updatedVehicle as any).photo;
    // }

    console.log(`🔄 Updated vehicle ${plate} and invalidated cache`);
    const updatedStripped = strip(updatedVehicle, PublicVehicleFields);
    await cache.set<PublicVehicle>(
      CacheKeys.vehicles.byPlate(plate),
      updatedStripped,
    );

    return updatedStripped;
  }

  /**
   * Update vehicle image
   */
  static async updateVehicleImage(
    vehicleId: string,
    image: File,
    userId: string,
  ): Promise<PublicVehicleSubmission | null> {
    // 1. Upload image in S3
    const { path, size } = await VehicleService.handleVehicleImage(
      userId,
      vehicleId,
      image,
    );

    // 2: Update database
    const updatedVehicle: VehicleSubmission | null =
      await db.vehicleSubmission.update({
        where: { id: vehicleId },
        data: {
          photos: {
            create: {
              url: path,
              uploadSizeKb: size,
            },
          },
        },
        include: { photos: true },
      });

    if (!updatedVehicle) {
      return null;
    }

    // 2. Invalidate relevant cache entries
    await cache.invalidate([
      CacheKeys.vehicles.submissions.byId(updatedVehicle.id),
    ]);

    console.log(
      `🔄 Updated vehicle image (${updatedVehicle.plate}) and invalidated cache`,
    );
    const updatedStripped = strip(
      updatedVehicle,
      PublicVehicleSubmissionFields,
    );

    if (!updatedStripped) {
      return null;
    }

    await cache.set<PublicVehicleSubmission>(
      CacheKeys.vehicles.submissions.byId(updatedVehicle.id),
      updatedStripped,
    );

    return updatedStripped;
  }

  /**
   * Submit vehicle to pool
   */
  static async submitVehicle(
    body: VehicleSubmissionCreateInput & { images?: File[] },
    userId: string,
  ): Promise<PublicVehicleSubmission | null> {
    const { value } = normalizeMake(body.make);

    // 1. Update in database
    const submission: VehicleSubmission | null =
      await db.vehicleSubmission.upsert({
        where: {
          plate_submittedById: { plate: body.plate, submittedById: userId },
        },
        update: {
          ...body,
          make: value,
        },
        create: {
          ...body,
          submittedBy: {
            connect: {
              id: userId,
            },
          },
        },
      });

    if (!submission) {
      return null;
    }

    // 3. Create photo records if user selected images (NO sharp yet)
    const uploadedFiles: {
      path: string;
      tempPath: string;
      filename: string;
      ext: string;
    }[] = [];

    const tmpDir = Bun.env.TMPDIR ?? Bun.env.TEMP ?? Bun.env.TMP ?? "/tmp";

    const files = Array.isArray(body.images) ? body.images : [body.images];

    // Loop through each image file
    for (const imageFile of files) {
      const randomID = crypto.randomUUID();

      // --- validate early ---
      if (!(imageFile instanceof File)) continue;

      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const safeFilename = `image-${randomID}`;
      const filepath = `${BucketNames.vehicles}/${body.plate}/${safeFilename}.${ext}`;

      // temp path
      const tempPath = `${tmpDir}/${randomID}.${ext}`;

      // write to disk
      await Bun.write(tempPath, await imageFile.arrayBuffer());

      uploadedFiles.push({
        path: filepath,
        tempPath,
        filename: imageFile.name,
        ext,
      });
    }
    // End of Loop

    // Run vehicle consensus after all images are processed
    this.runVehicleConsensus();

    const photoRecords = await db.vehiclePhoto.createManyAndReturn({
      data: files.map((file, index) => ({
        submittedVehicleId: submission.id,
        isPrimary: index === 0, // first image primary
        uploadSizeKb: file ? Math.ceil(file.size / 1024) : 0,
        url: null,
        status: UploadStatus.PROCESSING,
      })),
    });

    if (uploadedFiles.length > 0 && photoRecords.length > 0) {
      // 4. Enqueue image processing jobs
      for (let i = 0; i < uploadedFiles.length; i++) {
        await addVehicleSubmissionImageUploadJob(
          photoRecords[i]!.id,
          submission.id,
          uploadedFiles[i]!.tempPath,
          uploadedFiles[i]!.path,
          uploadedFiles[i]!.ext,
        );
      }
    }

    // 2. Invalidate relevant cache entries
    await cache.invalidate([
      CacheKeys.vehicles.submissions.byId(submission.id),
    ]);

    console.log(
      `🔄 Submitted vehicle ${submission.plate} and invalidated cache`,
    );
    const updatedStripped: PublicVehicleSubmission = strip(
      submission,
      PublicVehicleSubmissionFields,
    );
    await cache.set<PublicVehicleSubmission>(
      CacheKeys.vehicles.submissions.byId(submission.id),
      updatedStripped,
    );

    return updatedStripped;
  }

  /**
   * Handle vehicle image upload to S3
   */
  private static async handleVehicleImage(
    userId: string,
    vehicleId: string,
    imageFile: File,
  ): Promise<{ path: string; size: number }> {
    try {
      // Create unique filename
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const safeFilename = `image-${Date.now()}`;
      const filepath = `${BucketNames.vehicles}/${vehicleId}/${safeFilename}.${ext}`;
      const tmpDir = Bun.env.TMPDIR ?? Bun.env.TEMP ?? Bun.env.TMP ?? "/tmp";

      // 1. Save file to temp disk (or direct S3 raw upload)
      const tempPath = `${tmpDir}/${crypto.randomUUID()}.${ext}`;
      await Bun.write(tempPath, await imageFile.arrayBuffer());

      await addImageJob(userId, tempPath, filepath, ext);

      console.log(
        `📸 Uploaded image for vehicle ${vehicleId} to S3: ${filepath}`,
      );

      return { path: filepath, size: imageFile.size };
    } catch (error) {
      console.error(`Failed to upload image for vehicle ${vehicleId}:`, error);
      throw error;
    }
  }

  static async isMyVehicleSubmission(
    vehicleId: string,
    userId: string,
  ): Promise<boolean> {
    const cached = await cache.get<VehicleSubmission>(
      CacheKeys.vehicles.submissions.byId(vehicleId),
    );
    if (cached && cached.submittedById === userId) return true;

    const vehicle = await db.vehicleSubmission.findUnique({
      where: { id: vehicleId },
      select: {
        submittedById: true,
      },
    });

    return vehicle?.submittedById === userId;
  }

  /** AKA evaluateConsensus()
   * fetches ALL active submissions
   * @returns boolean
   */
  static async reEvaluateVehicleSubmissions(
    isActive: boolean | undefined | null = true,
  ): Promise<boolean> {
    let submissions: VehicleSubmission[] = [];

    const cached = await cache.get<VehicleSubmission[]>(
      CacheKeys.vehicles.submissions.all,
    );
    if (!cached) {
      const vehicles: VehicleSubmission[] | null =
        await db.vehicleSubmission.findMany({
          where: { isActive: isActive || undefined },
        });

      if (!vehicles) return false;

      submissions = vehicles;
    }

    submissions = cached!;

    await cache.set<VehicleSubmission[]>(
      CacheKeys.vehicles.submissions.all,
      submissions,
    );

    console.log(
      "| Processed ",
      submissions?.length ?? 0,
      " vehicle submissions",
    );

    return true;
  }

  /** CRON specific
   * Runs the vehicle consensus algorithm for all active vehicles.
   * @returns boolean
   */
  static async runVehicleConsensus(): Promise<boolean> {
    let submissions: VehicleSubmission[] = [];

    const cached = await cache.get<VehicleSubmission[]>(
      CacheKeys.vehicles.submissions.all,
    );
    if (!cached) {
      const vehicles: VehicleSubmission[] | null =
        await db.vehicleSubmission.findMany({
          where: { isActive: true },
        });

      if (!vehicles) return false;

      submissions = vehicles;
    }

    submissions = cached!;

    await cache.set<VehicleSubmission[]>(
      CacheKeys.vehicles.submissions.all,
      submissions,
    );

    console.log(
      "[CRON] Processed ",
      submissions?.length ?? 0,
      " active vehicle submissions",
    );

    for (const submission of submissions) {
      const submissions: VehicleSubmission[] | null =
        await VehicleService.getSubmissionsByPlate(submission.plate);
      console.log(
        "[CRON] Plate:",
        submission.plate,
        ": ",
        submissions?.length ?? 0,
      );

      if (!submissions?.length) continue;

      const consensus = VehicleService.computeConsensus(submissions ?? []);

      await VehicleService.materializeVehicle(
        submission.plate,
        consensus,
        submissions,
      );
    }

    return true;
  }

  static computeConsensus(submissions: VehicleSubmission[]): ConsensusResult {
    const active = submissions.filter((s) => s.isActive);

    return {
      plate: active[0]!.plate,
      totalSubmissions: active.length,
      fields: {
        make: majorityVote(active.map((s) => s.make)),
        model: majorityVote(active.map((s) => s.model)),
        year: majorityVote(active.map((s) => s.year)),
        color: majorityVote(active.map((s) => s.color)),
        type: majorityVote(active.map((s) => s.type)),
        forSale: majorityVote(active.map((s) => s.forSale)),
      },
    };
  }

  static async materializeVehicle(
    plate: string,
    consensus: ConsensusResult,
    submissions: VehicleSubmission[],
  ): Promise<void> {
    if (!submissions.length) return;

    // const consensus = computeConsensus(submissions);

    const isPublic =
      consensus.totalSubmissions >= Number(MIN_SUBMISSIONS_FOR_PUBLIC);

    const vehicleData: Partial<Vehicle> = {
      plate,
      make: resolveRequired<string>(
        consensus.fields.make.value,
        submissions,
        "make",
      ),
      model:
        consensus.fields.model.confidence >= Number(MIN_FIELD_CONFIDENCE)
          ? consensus.fields.model.value
          : null,
      year:
        consensus.fields.year.confidence >= Number(MIN_FIELD_CONFIDENCE)
          ? consensus.fields.year.value
          : null,
      color: resolveRequired<string>(
        consensus.fields.color.value,
        submissions,
        "color",
      ),
      type:
        consensus.fields.type.confidence >= Number(MIN_FIELD_CONFIDENCE)
          ? consensus.fields.type.value
          : null,
      forSale:
        consensus.fields.forSale.confidence >= Number(MIN_FIELD_CONFIDENCE)
          ? consensus.fields.forSale.value
          : null,
      confidence: computeOverallConfidence(consensus.fields),
      submissionCount: consensus.totalSubmissions,
      isActive: isPublic,
    };

    await VehicleService.upsertVehicleByPlate(plate, vehicleData);
  }

  static async cleanupFailedPhotos() {
    const { count } = await db.vehiclePhoto.deleteMany({
      where: {
        url: null,
        status: { in: [UploadStatus.PENDING, UploadStatus.FAILED] },
        createdAt: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24h
        },
      },
    });

    console.log(`[CRON] Deleted ${count} failed photos`);
  }
}

export default VehicleService;
