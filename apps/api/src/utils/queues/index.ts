import { Queue } from 'bullmq';
import { QueueEmail, QueueImage, QueueSubmission, QueueSubmissionPhotos } from './model';

const REDIS_PORT = Number(process.env.REDIS_PORT);
const REDIS_URL = String(process.env.REDIS_URL);

const createQueue  = <T>(name: string) => {
    return new Queue<T>(name, { connection: { url: REDIS_URL, host: 'localhost', port: REDIS_PORT } });
}

// Example: export a specific queue
const emailQueue = createQueue<QueueEmail>('emailQueue');
const imageQueue = createQueue<QueueImage>('imageQueue');
const vehicleSubmissionQueue = createQueue<QueueSubmission>('vehicleSubmissionQueue');
const vehicleSubmissionImageUploadQueue = createQueue<QueueSubmissionPhotos>('vehicleSubmissionImageUploadQueue');


export { emailQueue, imageQueue, vehicleSubmissionQueue, vehicleSubmissionImageUploadQueue }