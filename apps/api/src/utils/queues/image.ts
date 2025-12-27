import sharp from 'sharp';
import { imageQueue } from '.';
import { RedisEvents } from '~/utils/cache/keys';
import { BucketNames } from '~/utils/image/storage';
import { createWorker } from '~/utils/worker';
import { QueueImage } from './model';
import { Job } from 'bullmq';
import s3 from '~/utils/s3';
import db from '../database/client';

const addImageJob = async (userId: string, file: File, filepath: string, ext?: string) =>
    await imageQueue.add(RedisEvents.processImage, { userId, file, filepath, ext });

// Worker for this queue
const imageWorker = createWorker('imageQueue', async (job: Job) => {
    console.log('Image Worker:', job.name);

    if(job.name === RedisEvents.processImage){
        const { userId, file, filepath, ext } = job.data as QueueImage;
        // Put your actual logic here
        console.log(`[Queue]: 📷 Processing image: ${file.name}`);

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use Sharp to resize and optimize
        const optimizedBuffer = await sharp(buffer)
          .resize(256, 256, {
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

        return {
            filepath,
            uploadSizeKb,
        };
    }
});

export { addImageJob, imageWorker };