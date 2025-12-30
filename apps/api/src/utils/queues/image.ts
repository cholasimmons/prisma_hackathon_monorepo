import sharp from 'sharp';
import { imageQueue } from '.';
import { RedisEvents } from '~/utils/cache/keys';
import { createWorker } from '~/utils/worker';
import { QueueImage } from './model';
import { Job } from 'bullmq';
import s3 from '~/utils/s3';
import { unlink } from 'node:fs/promises';

const addImageJob = async (userId: string, tempPath: string, filepath: string, ext?: string) => {
    await imageQueue.add(RedisEvents.processImage, { userId, tempPath, filepath, ext }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
}

// Worker for this queue
const imageWorker = createWorker('imageQueue', async (job: Job) => {
    console.log('Image Worker:', job.name);

    if(job.name === RedisEvents.processImage){
        const { userId, tempPath, filepath, ext } = job.data as QueueImage;
        // Put your actual logic here
        console.log(`[Queue]: 📷 Processing ${ext} image`);

        // Convert File to ArrayBuffer
        // const arrayBuffer = await file.arrayBuffer();
        // const buffer = Buffer.from(arrayBuffer);

      try {
        const buffer = await Bun.file(tempPath).arrayBuffer();

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

        // Cleanup temp file
        await unlink(tempPath);

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

export { addImageJob, imageWorker };