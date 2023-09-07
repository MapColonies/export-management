import { FactoryFunction, container } from 'tsyringe';
import { DataSource } from 'typeorm';
import { TaskEntity } from '../entity/task';
import { ITaskEntity } from '../models/task';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTaskRepository = (dataSource: DataSource) => {
  // @ts-ignore
  console.log('3################',dataSource.avi)
  return dataSource.getRepository(TaskEntity).extend({
    async createEntity(entity: ITaskEntity): Promise<ITaskEntity> {
      const res = await this.save(entity);
      return res;
    },

    async findOneEntity(param: FindOneEntityParams): Promise<ITaskEntity | undefined> {
      const taskEntity = await this.findOne({ where: param, relations: ['artifacts', 'webhook', 'taskGeometries'] });
      if (taskEntity === null) {
        return undefined;
      }
      return taskEntity;
    },

    async getLatestEntitiesByLimit(limit: number): Promise<ITaskEntity[]> {
      const taskEntities = await this.find({ take: limit, order: { id: 'DESC' }, relations: ['artifacts', 'webhook', 'taskGeometries'] });
      return taskEntities;
    },

    // TODO: Consider use this function to convert geometry from WKT geometry
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

export type TaskRepository = ReturnType<typeof createTaskRepository>;
export type FindOneEntityParams = { id: number } | { jobId: string };

export const taskRepositoryFactory: FactoryFunction<TaskRepository> = (depContainer) => {
  return createTaskRepository(depContainer.resolve<DataSource>(DataSource));
};

export const TASK_REPOSITORY_SYMBOL = Symbol('TASK_REPOSITORY');
