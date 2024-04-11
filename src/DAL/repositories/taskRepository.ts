import { FactoryFunction, container } from 'tsyringe';
import { DataSource, getRepository } from 'typeorm';
import { TaskEntity } from '../entity/tasks';
import { ITaskEntity } from '../models/tasks';
import { CreateExportTaskRequest, CreateExportTaskResponse, GetEstimationsResponse, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { WebhookEntity } from '../entity';
import { WEBHOOKS_REPOSITORY_SYMBOL, WebhooksRepository } from './webhooksRepository';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTaskRepository = (dataSource: DataSource) => {
  const webhooksRepositories = container.resolve<WebhooksRepository>(WEBHOOKS_REPOSITORY_SYMBOL);
  return dataSource.getRepository(TaskEntity).extend({
    async createTask(entity: TaskEntity): Promise<TaskEntity> {
      const res = await this.save(entity);
      return res;
    },

    async getTaskById(param: FindTaskParams): Promise<ITaskEntity | undefined> {
      const taskEntity = await this.findOne({ where: param, relations: ['Artifacts', 'Webhooks', 'TaskGeometries'] });
      if (taskEntity === null) {
        return undefined;
      }
      return taskEntity;
    },

    async getCustomerTaskByJobId(jobId: string, customerName: string): Promise<ITaskEntity | undefined> {
      const taskEntity = await this.findOne({ where: {jobId, customerName}, relations: ['Webhooks'] });
      if (taskEntity === null) {
        return undefined;
      }
      return taskEntity;
    },

    async getLatestTasksByLimit(limit: number): Promise<ITaskEntity[]> {
      const taskEntities = await this.find({ take: limit, order: { id: 'DESC' }, relations: ['Artifacts', 'Webhooks', 'TaskGeometries'] });
      return taskEntities;
    },

    async isCustomerTaskExists(jobId: string, customerName?: string): Promise<boolean> {
      return await this.exist({ where: { jobId, customerName, status: TaskStatus.IN_PROGRESS || TaskStatus.PENDING } });
    },

    async handleExistsCustomerTask(req: CreateExportTaskRequest<TaskParameters>, jobId: string, customerName?: string): Promise<void> {
      const task = await this.findOneBy({ jobId, customerName, status: TaskStatus.IN_PROGRESS || TaskStatus.PENDING });
      if (task) {
        Object.assign(task, { webhooks: req.webhooks });
        console.log('task found:', task);   
        await this.saveTask(task)
      }
    },

    async createAndSaveTask(req: CreateExportTaskRequest<TaskParameters>, exportTaskResponse: CreateExportTaskResponse, estimations: GetEstimationsResponse, customerName?: string): Promise<ITaskEntity> {
      const task = this.create({
        ...req,
        ...exportTaskResponse,
        ...estimations,
        customerName
      });

      const res = await this.save(task);
      return res;
    }
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
