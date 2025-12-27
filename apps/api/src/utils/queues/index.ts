import { Queue } from 'bullmq';

const REDIS_PORT = Number(process.env.REDIS_PORT);
const REDIS_URL = String(process.env.REDIS_URL);

const createQueue  = (name: string) => {
    return new Queue(name, { connection: { url: REDIS_URL, host: 'localhost', port: REDIS_PORT } });
}

// Example: export a specific queue
export const emailQueue = createQueue('emailQueue');
export const imageQueue = createQueue('imageQueue');