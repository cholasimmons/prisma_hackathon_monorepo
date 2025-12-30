import { emailQueue } from './';
import { createWorker } from '../worker';
import { QueueEmail } from './model';
import { Job } from 'bullmq';
import { RedisEvents } from '../cache/keys';
import { sendMail } from '../mailer';

export const addEmailJob = async ({ to, subject, html }: QueueEmail) => {
  await emailQueue.add(RedisEvents.sendEmail, { to, subject, html },
    { attempts: 5, backoff:{ type:'exponential', delay:2500 }, removeOnComplete:true, removeOnFail:false });
};

// Worker for this queue
export const emailWorker = createWorker('emailQueue', async (job: Job) => {
    console.log('Email Worker:', job.name);

    if(job.name === RedisEvents.sendEmail){
      const { to, subject, html } = job.data as QueueEmail;

      await sendMail(to, subject, html);
      console.log(`📧 Sent "${subject}" to: ${to}`);
    }

});
