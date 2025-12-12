import { Prisma, Vehicle, VehicleSubmission } from "@/generated/prisma/client";
import { cache } from "~/utils/cache";
import db from "~/utils/database/client";
import { strip } from "~/utils/strip";
import { PublicVehicleFields, PublicVehicleSubmissionFields } from "./model";
import type { PublicVehicle, PublicVehicleSubmission } from "./model";
import { CacheKeys } from "~/utils/cache/keys";
import { VehicleSubmissionCreateInput } from "@/generated/prisma/models";

abstract class VehicleService {
  static async searchVehicles(params: {
    make?: string;
    year?: number;
    limit?: number;
    color?: string;
  }): Promise<Vehicle[]> {
    const { make, year, limit, color } = params;
    const where: Prisma.VehicleWhereInput = {};

    if (make) where.make = make;
    if (year) where.year = year;
    if (color) where.color = color;

    return await db.vehicle.findMany({
      where,
      take: limit,
    });
  }

  static async searchSubmittedVehicles(
    params: {
      make?: string;
      year?: number;
      limit?: number;
      color?: string;
    },
    userId: string,
  ): Promise<VehicleSubmission[]> {
    const { make, year, limit, color } = params;
    const where: Prisma.VehicleSubmissionWhereInput = {};

    if (make) where.make = make;
    if (year) where.year = year;
    if (color) where.color = color;
    where.submittedById = userId;

    return await db.vehicleSubmission.findMany({
      where,
      take: limit,
    });
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

  /**
   * Get vehicle with image URL
   */
  static async getVehicleWithImage(
    id: string,
  ): Promise<(PublicVehicle & { imageUrl?: string }) | null> {
    const vehicle = await this.getVehicleById(id);

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
    // if (updates.image) {
    //   await VehicleService.handleVehicleImage(id, updates.image);
    //   // Remove the temporary imageFile property
    //   delete (updatedVehicle as any).photo;
    // }

    console.log(`🔄 Updated vehicle ${id} and invalidated cache`);
    const updatedStripped = strip(updatedVehicle, PublicVehicleFields);
    await cache.set<PublicVehicle>(
      CacheKeys.vehicles.byId(id),
      updatedStripped,
    );

    return updatedStripped;
  }

  /**
   * Submit vehicle to pool
   */
  static async submitVehicle(
    body: VehicleSubmissionCreateInput & { image?: File },
    userId: string,
  ): Promise<PublicVehicleSubmission | null> {
    // 1. Update in database
    const submission: VehicleSubmission | null =
      await db.vehicleSubmission.upsert({
        where: {
          plate_submittedById: { plate: body.plate, submittedById: userId },
        },
        update: {
          ...body,
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

    // 2. Invalidate relevant cache entries
    await cache.invalidate([CacheKeys.vehicles.submissionById(submission.id)]);

    // 3. If there's an image upload, handle it
    // if (body.image) {
    //   await VehicleService.handleVehicleImage(submission.id, body.image);
    //   // Remove the temporary imageFile property
    //   delete (submission as any).photos;
    // }

    console.log(
      `🔄 Submitted vehicle ${submission.plate} and invalidated cache`,
    );
    const updatedStripped: PublicVehicleSubmission = strip(
      submission,
      PublicVehicleSubmissionFields,
    );
    await cache.set<PublicVehicleSubmission>(
      CacheKeys.vehicles.submissionById(submission.id),
      updatedStripped,
    );

    return updatedStripped;
  }

  /**
   * Handle vehicle image upload to S3
   */
  // private static async handleVehicleImage(
  //   vehicleId: string,
  //   imageFile: File,
  //   ): Promise<void> {
  //   try {
  //     // Create unique filename
  //     const extension = imageFile.name.split(".").pop() || "jpg";
  //     const fileName = `vehicles/${vehicleId}/image-${Date.now()}.${extension}`;

  //     // Upload to S3
  //     const s3File = s3.file(fileName);
  //     await s3File.write(imageFile, {
  //       type: imageFile.type,
  //       // metadata: {
  //       //   vehicleId: vehicleId.toString(),
  //       //   uploadedAt: new Date().toISOString(),
  //       // },
  //     });

  //     console.log(
  //       `📸 Uploaded image for vehicle ${vehicleId} to S3: ${fileName}`,
  //     );

  //     // Update vehicle with image key
  //     await db.vehicle.update({
  //       where: { id: vehicleId },
  //       data: { photos: fileName },
  //     });
  //   } catch (error) {
  //     console.error(`Failed to upload image for vehicle ${vehicleId}:`, error);
  //     throw new Error(`Image upload failed: ${error}`);
  //   }
  // }

  static async computeConsensus(plate: string) {
    const submissions = await db.vehicleSubmission.findMany({
      where: { plate },
      orderBy: { createdAt: "asc" },
      include: { photos: true },
    });

    if (!submissions.length) return null;

    const fields = ["color", "make", "model", "year"] as const;

    const result: any = { plate };

    // 1. Majority vote for each attribute
    for (const field of fields) {
      const votes = submissions
        .map((s: VehicleSubmission) => s[field])
        .filter(Boolean);

      if (votes.length === 0) {
        result[field] = null;
        continue;
      }

      const freq: Record<string, number> = {};
      for (const v of votes) freq[v!] = (freq[v!] || 0) + 1;

      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      result[field] = sorted[0][0];
    }

    // 2. Determine the best photo by clustering pHashes
    // const photos = submissions.filter((s: VehicleSubmission) => s.photos && s.pHash);

    // if (!photos.length) {
    //   result.photos = null;
    // } else {
    //   // TODO: Fix this
    //   result.photos = null; // this.findConsensusPhoto(photos[0]);
    // }

    return result;
  }

  // private static getMode(list: string[]) {
  //   if (!list || list.length === 0) return null;

  //   const counts = new Map();
  //   list.forEach((item) => {
  //     if (!item) return;
  //     counts.set(item, (counts.get(item) || 0) + 1);
  //   });

  //   // find max
  //   let max = 0;
  //   let result = null;
  //   for (const [value, count] of counts.entries()) {
  //     if (count > max) {
  //       max = count;
  //       result = value;
  //     }
  //   }

  //   return result;
  // }

  // private static findConsensusPhoto(
  //   photos: { photo: string; pHash: string }[],
  //   ): string | null {
  //   if (photos.length === 1) return photos[0].photo;

  //   // pick the photo that has the lowest average hamming distance to others
  //   let bestPhoto = photos[0].photo;
  //   let bestScore = Infinity;

  //   for (const p of photos) {
  //     let total = 0;

  //     for (const q of photos) {
  //       if (p === q) continue;
  //       total += hammingDistance(p.pHash, q.pHash);
  //     }

  //     const avg = total / (photos.length - 1);
  //     if (avg < bestScore) {
  //       bestScore = avg;
  //       bestPhoto = p.photo;
  //     }
  //   }

  //   return bestPhoto;
  // }

  // private async saveConsensus(plate: string) {
  //   const data = await VehicleService.computeConsensus(plate);
  //   if (!data) return null;

  //   return prisma.vehicle.upsert({
  //     where: { plate },
  //     update: data,
  //     create: data,
  //   });
  // }
}

export default VehicleService;
