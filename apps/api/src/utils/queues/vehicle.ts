import { RedisEvents } from '~/utils/cache/keys';
import { createWorker } from '~/utils/worker';
import { QueueSubmission, QueueSubmissionPhotos } from './model';
import { Job } from 'bullmq';
import { vehicleSubmissionImageUploadQueue, vehicleSubmissionQueue } from '.';
import db from '~/utils/database/client';
import { pickMajority } from '../vehicles/majorityResolver';
import sharp from 'sharp';
import s3 from '../s3';

const addVehicleSubmissionJob = async (userId: string, submittedVehiclePlate: string) =>
    await vehicleSubmissionQueue.add(RedisEvents.submitVehicle, { userId, submittedVehiclePlate });

const addVehicleSubmissionImageUploadJob = async (photoId: string, submissionId: string, tempPath: string, filepath: string, ext?: string) =>
    await vehicleSubmissionImageUploadQueue.add(RedisEvents.submitVehiclePhotos, { photoId, submissionId, tempPath, filepath, ext });

// Worker for this queue
const vehicleSubmissionWorker = createWorker('vehicleSubmissionQueue', async (job: Job) => {
    console.log('Vehicle Submission Worker:', job.name);

  if (job.name === RedisEvents.submitVehicle) {
    const { userId, submittedVehiclePlate } = job.data as QueueSubmission;

    console.log(`[Queue]: 📷 Processing submission: ${submittedVehiclePlate}`);

    const submissions = await db.vehicleSubmission.findMany({
      where: {
        plate: submittedVehiclePlate,
        isActive: true
      }
    })

    if (!submissions || submissions.length === 0) return;

    const make = pickMajority(submissions.map(s => s.make))
    const model = pickMajority(submissions.map(s => s.model))
    const color = pickMajority(submissions.map(s => s.color))
    const year = pickMajority(submissions.map(s => s.year))
    const type = pickMajority(submissions.map(s => s.type))
    const forSale = pickMajority(submissions.map(s => s.forSale))

    const maxVotes = Math.max(
      make.count,
      model.count,
      color.count,
      year.count,
      type.count,
      forSale.count
    )

    const confidence = maxVotes / submissions.length

    await db.vehicle.upsert({
      where: { plate: submittedVehiclePlate },
      create: {
        plate: submittedVehiclePlate,
        make: make.value!,
        model: model.value,
        color: color.value!,
        year: year.value,
        type: type.value,
        forSale: forSale.value,
        submissionCount: submissions.length,
        confidence
      },
      update: {
        make: make.value!,
        model: model.value,
        color: color.value!,
        year: year.value,
        type: type.value,
        forSale: forSale.value,
        submissionCount: submissions.length,
        confidence
      }
    });

    console.log(`[Queue]: ✅ Vehicle submission processed: ${submittedVehiclePlate}`);
  } else
  if (job.name === RedisEvents.submitVehiclePhotos) {
    const { photoId, submissionId, tempPath, filepath, ext } = job.data as QueueSubmissionPhotos;

    console.log(`[Queue]: 📷 Processing ${ext} image`);
    try {
      const arrayBuffer = await Bun.file(tempPath).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Use Sharp to resize and optimize
      const optimizedBuffer = await sharp(buffer)
        .resize(1280, 768, {
          fit: "inside", // maintain aspect ratio, max 256x256
          withoutEnlargement: true, // don't upscale small images
        })
        .jpeg({ quality: 80 }) // compress to JPEG with 80% quality
        .toBuffer();

      // Upload to S3
      const s3File = s3.file(filepath);
      const uploadSizeKb = await s3File.write(optimizedBuffer, {
        type: "image/jpeg",
        // metadata: {
        //   vehicleId: vehicleId.toString(),
        //   uploadedAt: new Date().toISOString(),
        // },
      });

      await db.vehiclePhoto.update({
        where: { id: photoId },
        data: {
          url: filepath,
          // width: buffer.width,
          // height: metadata.height,
          // pHash: metadata.pHash
        }
      });

      // Cleanup temp file
      await Bun.file(tempPath).delete();

      return {
          filepath,
          uploadSizeKb,
      };
    } catch (err) {
      console.error('Image processing failed', err);
      throw err; // let BullMQ retry
    }
  }
});

export { addVehicleSubmissionJob, vehicleSubmissionWorker, addVehicleSubmissionImageUploadJob };