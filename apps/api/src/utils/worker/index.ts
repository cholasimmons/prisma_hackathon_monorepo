import { Worker } from 'bullmq';

const REDIS_PORT = Number(process.env.REDIS_PORT);
const REDIS_URL = String(process.env.REDIS_URL);

export const createWorker = (
    name: string,
    processor: (job: any) => Promise<any>
) => {
    const worker = new Worker(name, processor, {
      maxStartedAttempts: 3,
      maxStalledCount: 3,
      concurrency: 1,
      connection: { url: REDIS_URL, host: 'localhost', port: REDIS_PORT }
    });

    worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id}: (${job.name}) completed`);
    });

    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id}: (${job?.name || 'annonymous'}) failed:`, err);
    });


    return worker;
};
