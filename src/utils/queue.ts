import { Job, Queue, Worker } from 'bullmq';
import { fastify } from '../server.ts';
import { mailSender } from './mailSender.ts';

export const OPTIONS = {
  connection: {
    url: process.env.REDIS_URL!,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export const queue = (name: string): Queue => {
  return new Queue(name, OPTIONS);
};

// Worker for sending welcome emails
const welcomeEmailWorker = new Worker(
  'sendWelcomeEmail',
  async (job: Job) => {
    const { to, name, type } = job.data;
    fastify.log.info(`Sending welcome email to ${to}...`);
    await mailSender({ to, name, type });
    fastify.log.info(`Welcome email sent to ${to}`);
  },
  OPTIONS
);

welcomeEmailWorker.on('completed', (job) => fastify.log.info(`Welcome email job ${job.id} completed`));
welcomeEmailWorker.on('failed', (job, err) => fastify.log.error(`Welcome email job ${job?.id} failed` + err));
