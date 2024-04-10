import { FactoryFunction } from 'tsyringe';
import { DataSource, getRepository } from 'typeorm';
import { TaskEntity } from '../entity/tasks';
import { ITaskEntity } from '../models/tasks';
import { CreateExportTaskRequest, CreateExportTaskResponse, GetEstimationsResponse, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { WebhookEntity } from '../entity';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTaskRepository = (dataSource: DataSource) => {
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

    async getLatestTasksByLimit(limit: number): Promise<ITaskEntity[]> {
      const taskEntities = await this.find({ take: limit, order: { id: 'DESC' }, relations: ['Artifacts', 'Webhooks', 'TaskGeometries'] });
      return taskEntities;
    },

    async isCustomerTaskExists(jobId: string, customerName?: string): Promise<boolean> {
      return await this.exist({where: {jobId, customerName, status: TaskStatus.IN_PROGRESS || TaskStatus.PENDING}})
    },

    async getExistsCustomerTask(jobId: string, customerName?: string): Promise<TaskEntity | null> {
      const task = await this.findOneBy({jobId, customerName, status: TaskStatus.IN_PROGRESS || TaskStatus.PENDING})
      return task;
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
    // TODO: Consider use this function to convert geometry from WKT geometry - Task with Shimon
    // async updateTaskGeometry(): Promise<void> {
    //   const queryRunner = dataSource.createQueryRunner();
    //   await queryRunner.query(`
    //   CREATE FUNCTION task_geometry_update_geometry() RETURNS trigger
    //   SET search_path FROM CURRENT
    //     LANGUAGE plpgsql
    //     AS $$
    //   BEGIN
    //   IF NEW.wkt_geometry IS NULL THEN
    //       RETURN NEW;
    //   END IF;
    //   NEW.wkb_geometry := ST_GeomFromText(NEW.wkt_geometry,4326);
    //   RETURN NEW;
    //   END;
    //   $$`);
    // },
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
