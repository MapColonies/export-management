// import { ConnectionOptions } from "@map-colonies/chameleon-mq/dist/connection";
// import { TaskCompletedMessage, TaskEvent, TaskStatus } from "@map-colonies/export-interfaces";
// import { ArtifactRasterType, Domain } from "@map-colonies/types";
// import { QueueManager } from "@map-colonies/chameleon-mq/dist/queue";

// const connection: ConnectionOptions = { host: '10.45.148.34', port: 6379 };
// const queue = new QueueManager('topic1', connection);
// const taskCompletedMessage: TaskCompletedMessage = {
//     status: TaskStatus.COMPLETED,
//     domain: Domain.RASTER,
//     jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
//     finishedAt: new Date(),
//     precentage: 100,
//     artifacts: [{name: 'artifact.gpkg', size: 5864, type: ArtifactRasterType.GPKG, url: "localhost:8080/download", sha256: 'dsf4t45gf-t65-dfg5r55'}],
//     event: TaskEvent.TASK_COMPLETED
// }
// export const publish = async()=> await queue.publish({ data: taskCompletedMessage, name: taskCompletedMessage.event })
// console.log("DONE")
