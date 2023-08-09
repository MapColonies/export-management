import { TaskEntity } from '../entity/task';
import { FactoryFunction } from 'tsyringe';
import { DataSource, In, QueryRunner } from 'typeorm';
import { TaskModel } from '../models/task';
import { TaskModelConvertor } from '../convertors/taskModelConverter';
import { TaskEvent, Webhook } from '@map-colonies/export-interfaces';
import { CreateExportTaskExtendedRequest } from '../../tasks/models/tasksManager';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

const createTaskRepository = (dataSource: DataSource, taskConvertor: TaskModelConvertor) => {
  return dataSource.getRepository(TaskEntity).extend({
    async createEntity(model: TaskModel): Promise<void> {
      const taskEntity = taskConvertor.createModelToEntity(model);
      console.log("TASKENTITY:", taskEntity);
      await this.save(taskEntity);
    },

    async findOneEntity(id: number): Promise<TaskEntity | undefined> {
      console.log(id)
      const taskEntity = await this.findOne({ where: { id } });
      if (taskEntity === null) {
        return undefined;
      }
      return taskEntity;
    },

    async findEntitiesByLimit(limit: number): Promise<TaskEntity[]> {
      const taskEntities = await this.find({take: limit});
      return taskEntities;
    },

    async findManyEntitiesByIds(entities: TaskEntity[]): Promise<TaskEntity[] | undefined> {
      // due to both entityId and fileId being unique uuids this operation is valid
      const entityEntities = await this.findBy({ id: In(entities.map((e) => e.id)) });
      if (entityEntities.length === 0) {
        return undefined;
      }
      return entityEntities;
    },

    async updateTaskGeometry(): Promise<void> {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.query(`
      CREATE FUNCTION task_geometry_update_geometry() RETURNS trigger
      SET search_path FROM CURRENT
        LANGUAGE plpgsql
        AS $$
      BEGIN
      IF NEW.wkt_geometry IS NULL THEN
          RETURN NEW;
      END IF;
      NEW.wkb_geometry := ST_GeomFromText(NEW.wkt_geometry,4326);
      RETURN NEW;
      END;
      $$`);
    },
  });
};

export type TaskRepository = ReturnType<typeof createTaskRepository>;

export const entityRepositoryFactory: FactoryFunction<TaskRepository> = (depContainer) => {
  return createTaskRepository(depContainer.resolve<DataSource>(DataSource), depContainer.resolve(TaskModelConvertor));
};

export const TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL = Symbol('TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL');
