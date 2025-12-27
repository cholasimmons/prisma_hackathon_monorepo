import { emailQueue } from './';
import { createWorker } from '../worker';
import { RedisEvents } from '~/config/constants';
import { QueueEmail } from './model';
import { Job } from 'bullmq';

export const addEmailJob = async (payload: QueueEmail) => {
  await emailQueue.add(RedisEvents.sendEmail, payload,
    { attempts: 5, backoff:{ type:'exponential', delay:2500 }, removeOnComplete:true, removeOnFail:false });
};

// Worker for this queue
export const emailWorker = createWorker('emailQueue', async (job: Job) => {
    console.log('Email Worker:', job.name);

    if(job.name === RedisEvents.sendEmail){
      const { to } = job.data as QueueEmail;
      // Put your actual email sending logic here
      console.log(`📧 Sending email to: ${to}`);
    }

});
