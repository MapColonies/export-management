/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Queue, QueueEvents, Worker } from "bullmq";

const onCompleted = (job: any) => {
    console.log(job, 'is completed!');
}

const onProgress = (job: any) => {
    console.log('is on progress: ', job);
}

const onFailed = (job: any) => {
    console.log('is on faield: ', job);
}

const onActive = (job: any) => {
    console.log('is on active!: ', job);
}
// Create a new connection in every instance
export const initialQueue = () => {

    const webhookQueue = new Queue('webhookQueue', {
        connection: {
            host: "localhost",
            port: 6379
        }
    });

    void webhookQueue.add('Pending', { task: 'blabla' });
    const webhookQueueListener = new QueueEvents('webhookQueue');
    webhookQueueListener.on('failed', (job) => onFailed(job))
    webhookQueueListener.on('progress', (job) => onProgress(job))
    webhookQueueListener.on('completed', (job) => onCompleted(job))
    webhookQueueListener.on('active', (job)=> onActive(job))
}

