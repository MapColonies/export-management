import { container } from 'tsyringe';
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

    // public async getRepository<T>(): Promise<Repository<T>> {
    //     return this.repository;
    // }
    public async getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>, customRepository: ThisType<Repository<T>>): Promise<TaskRepository> {
        
        console.log("DATASORUCE:", this.dataSource);
        const repository = new TaskRepository();
        // repository.extend(customRepository);
        return repository;
    }
  }

  return BaseRepository;
};

//   public async getRepository<T>(repository: Repository<ObjectLiteral>): Promise<T> {
//     const dataSource = await dataManager.getDataSource();
//     return new Repository<ObjectLiteral>;
//   };

//   public async getRepository<T extends ObjectLiteral>(): Promise<Repository<T>> {
//     const dataSource = await connectionManager.getDataSource();
//       return dataSource.getC
//     dataSource.
//     if (dataSource !== undefined) {
//       return dataSource;
//     }
//     const dataSource = await dataManager.getDataSource();
//     return new ProductRepository(dataSource);
//   };
