import { FactoryFunction, container } from 'tsyringe';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { SERVICES } from '../../common/constants';
import { IConfig, IDbConfig } from '../../common/interfaces';
import { TaskEntity } from '../entity/task';
import { ConnectionManager } from '../connectionManager';
import { TaskRepository } from './taskRepository';

export const BaseRepository = <T extends ObjectLiteral>(entity: EntityTarget<T>) => {
  class BaseRepository extends Repository<T> {
    protected repository: Repository<T>;
    private readonly connectionManager: ConnectionManager;
    constructor(private dataSource: DataSource) {
        super(entity, dataSource.createEntityManager());
      }
    }

  return BaseRepository;
};
