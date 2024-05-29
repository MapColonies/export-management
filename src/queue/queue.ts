import { ConnectionOptions } from "@map-colonies/chameleon-mq/dist/connection";
import { TaskCompletedMessage, TaskEvent, TaskStatus } from "@map-colonies/export-interfaces";
import { ArtifactRasterType, Domain } from "@map-colonies/types";
import {QueuePublisher } from "@map-colonies/chameleon-mq/dist/queue";

const connection: ConnectionOptions = { host: '10.45.148.34', port: 6379 };
const queue = new QueuePublisher('topic1', connection);
const taskCompletedMessage: TaskCompletedMessage = {
    status: TaskStatus.COMPLETED,
    customerName: 'unknown',
    domain: Domain.RASTER,
    jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1831d',
    finishedAt: new Date(),
    progress: 100,
    artifacts: [{ name: 'artifact.gpkg', size: 5864, type: ArtifactRasterType.GPKG, url: "localhost:8080/download", sha256: 'dsf4t45gf-t65-dfg5r55' }],
    event: TaskEvent.TASK_COMPLETED
}

export const publish = async () => {
    const t = await queue.publish({ data: taskCompletedMessage, name: taskCompletedMessage.event }, {backoff: 5000});
    return t.id
}
