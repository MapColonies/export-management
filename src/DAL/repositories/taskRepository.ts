import { FactoryFunction } from 'tsyringe';
import { DataSource } from 'typeorm';
import { TaskEntity } from '../entity/task';
import { ITaskEntity } from '../models/task';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTaskRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(TaskEntity).extend({
    async createTask(entity: ITaskEntity): Promise<ITaskEntity> {
      const res = await this.save(entity);
      return res;
    },

    async getTaskById(param: FindTaskParams): Promise<ITaskEntity | undefined> {
      const taskEntity = await this.findOne({ where: param, relations: ['artifacts', 'webhook', 'taskGeometries'] });
      if (taskEntity === null) {
        return undefined;
      }
      return taskEntity;
    },

    async getLatestTasksByLimit(limit: number): Promise<ITaskEntity[]> {
      const taskEntities = await this.find({ take: limit, order: { id: 'DESC' }, relations: ['artifacts', 'webhook', 'taskGeometries'] });
      return taskEntities;
    },

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
