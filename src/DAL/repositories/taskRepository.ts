import { FactoryFunction } from 'tsyringe';
import { DataSource } from 'typeorm';
import { TaskEntity } from '../entity/tasks';
import { ITaskEntity } from '../models/tasks';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTaskRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(TaskEntity).extend({
    async createTask(entity: TaskEntity): Promise<TaskEntity> {
      const res = await this.save(entity);
      return res;
    },

    async getTaskById(param: FindTaskParams): Promise<ITaskEntity | undefined> {
      const taskEntity = await this.findOne({ where: param, relations: ['artifacts', 'webhooks', 'taskGeometries'] });
      if (taskEntity === null) {
        return undefined;
      }
      return taskEntity;
    },

    async getCustomerTaskByJobId(jobId: string, customerName?: string): Promise<ITaskEntity | undefined> {
      const taskEntity = await this.findOne({ where: { jobId, customerName }, relations: ['webhooks'] });
      if (taskEntity === null) {
        return undefined;
      }
      return taskEntity;
    },

    async getLatestTasksByLimit(limit: number): Promise<ITaskEntity[]> {
      const taskEntities = await this.find({ take: limit, order: { id: 'DESC' }, relations: ['artifacts', 'webhooks', 'taskGeometries'] });
      return taskEntities;
    },

    async saveTask(task: ITaskEntity): Promise<ITaskEntity> {
      const res = await this.save(task);
      return res;
    },
  });
};

// eslint-disable-next-line import/exports-last
export interface FindTaskByJobId {
  jobId: string;
}

// eslint-disable-next-line import/exports-last
export interface FindTaskById {
  id: number;
}

export type TaskRepository = ReturnType<typeof createTaskRepository>;
export type FindTaskParams = FindTaskById | FindTaskByJobId;

export const taskRepositoryFactory: FactoryFunction<TaskRepository> = (depContainer) => {
  return createTaskRepository(depContainer.resolve<DataSource>(DataSource));
};

export const TASK_REPOSITORY_SYMBOL = Symbol('TASK_REPOSITORY');
