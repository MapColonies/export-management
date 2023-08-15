import { FactoryFunction } from 'tsyringe';
import { DataSource } from 'typeorm';
import { TaskEntity } from '../entity/task';
import { ITaskEntity } from '../models/task';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

const createTaskRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(TaskEntity).extend({
    async createEntity(entity: ITaskEntity): Promise<TaskEntity> {
      return await this.save(entity);
    },

    async findOneEntity(id: number): Promise<TaskEntity | undefined> {
      const taskEntity = await this.findOne({ where: { id } });
      if (taskEntity === null) {
        return undefined;
      }
      return taskEntity;
    },

    async getLatestEntitiesByLimit(limit: number): Promise<TaskEntity[]> {
      const taskEntities = await this.find({ take: limit, order: {id: 'DESC'} });
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

export const entityRepositoryFactory: FactoryFunction<TaskRepository> = (depContainer) => {
  return createTaskRepository(depContainer.resolve<DataSource>(DataSource));
};

export const TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL = Symbol('TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL');
