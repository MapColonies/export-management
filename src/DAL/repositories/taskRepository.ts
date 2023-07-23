import { TaskEntity } from '../entity/task';
import { container, singleton } from 'tsyringe';
import { TaskModelConvertor } from '../convertors/taskModelConverter';
import { DataSource, EntityTarget, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { ITaskCreate } from '../../tasks/interfaces';
import { TaskParameters } from '@map-colonies/export-interfaces';
import { TaskModel } from '../models/task';
import { BaseRepository } from './baseRepository';
import { ConnectionManager } from '../connectionManager';

@singleton()
export class TaskRepository extends BaseRepository(TaskEntity) {
  private readonly taskConvertor: TaskModelConvertor;
  private readonly connection: ConnectionManager;

  constructor() {
    super(container.resolve('dataSource'));
  }

  public async createTask(model: TaskModel): Promise<string> {
    const entity = this.taskConvertor.createModelToEntity(model);
    const res = await this.createQueryBuilder().insert().values(entity).returning('id').execute();
    return res.identifiers[0]['id'];
  }

  public test(): void {
    console.log('test');
  }
  
  // public async getRepository2 (): Promise<TaskRepository> {

  //   return taskRepository;
  // };
  // public async getRepository<T>(entity: EntityTarget<ObjectLiteral>): Promise<Repository<ObjectLiteral>> {
  //   return this.dataSource.getRepository(entity);
  // }
}
