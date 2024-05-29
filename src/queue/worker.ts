import { Job } from "@map-colonies/chameleon-mq/dist/worker";
import { container } from "tsyringe";
import { TASK_REPOSITORY_SYMBOL, TaskRepository } from "../DAL/repositories/taskRepository";
import { TaskEventMessage } from "@map-colonies/export-interfaces";
import { SERVICES } from "../common/constants";
import { Logger } from "@map-colonies/js-logger";

export const workerJobHandler = async (job:  Job<TaskEventMessage>): Promise<any> => {
  const logger = container.resolve<Logger>(SERVICES.LOGGER);
  const taskRepository = container.resolve<TaskRepository>(TASK_REPOSITORY_SYMBOL);
  try {
    logger.info({msg: `update job`})
    await taskRepository.updateTask(job.data);
  } catch (error) {
    console.error("ERROR,", error)
    throw error;
  }
}
