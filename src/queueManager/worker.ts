// import { Job, WorkerManager } from "@map-colonies/chameleon-mq/dist/worker";
// import { TaskEvent } from "@map-colonies/export-interfaces";
// import { TASK_REPOSITORY_SYMBOL, TaskRepository } from "../DAL/repositories/taskRepository";
// import { inject, injectable, singleton } from "tsyringe";

// @singleton()
// export class WorkerHandler {
//   private readonly test: number;
//   public constructor(@inject(TASK_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository) {
//   }

//   public async workerJobHandler(job: Job): Promise<void> {
//     try {
//       switch (job.name) {
//         case TaskEvent.TASK_COMPLETED:
//           await this.taskRepository.updateTask(job.data);
//           break;
//       }
//     }
//     catch (error) {
//       console.error('error', error);
//       throw new Error((error as Error).message);
//     }
//   }
// }
