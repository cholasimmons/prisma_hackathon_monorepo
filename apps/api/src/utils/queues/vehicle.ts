import { RedisEvents } from '~/utils/cache/keys';
import { createWorker } from '~/utils/worker';
import { QueueSubmission, QueueSubmissionPhotos } from './model';
import { Job } from 'bullmq';
import { vehicleSubmissionImageUploadQueue, vehicleSubmissionQueue } from '.';
import db from '~/utils/database/client';
import { pickMajority } from '../vehicles/majorityResolver';

const addVehicleSubmissionJob = async (userId: string, submittedVehiclePlate: string) =>
    await vehicleSubmissionQueue.add(RedisEvents.submitVehicle, { userId, submittedVehiclePlate });

const addVehicleSubmissionImageUploadJob = async (userId: string, submittedVehiclePhotoId: string, file: File) =>
    await vehicleSubmissionImageUploadQueue.add(RedisEvents.submitVehiclePhotos, { userId, submittedVehiclePhotoId, file });

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
    const { userId, submittedVehiclePhotoId, file } = job.data as QueueSubmissionPhotos;

    console.log(`[Queue]: 📷 Processing submission photos: ${submittedVehiclePhotoId}`);
  }
});

export { addVehicleSubmissionJob, vehicleSubmissionWorker, addVehicleSubmissionImageUploadJob };