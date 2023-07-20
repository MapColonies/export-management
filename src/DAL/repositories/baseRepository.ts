import { container } from 'tsyringe';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { SERVICES } from '../../common/constants';
import { IConfig, IDbConfig } from '../../common/interfaces';
import { TaskEntity } from '../entity/task';

export class BaseRepository extends Repository<T> {
  protected readonly dbConfig: IDbConfig;
  private readonly config: IConfig;

  constructor(dataSource: DataSource) {
    super(TaskEntity, dataSource.createEntityManager());
  }

  public async getRepository<T extends ObjectLiteral>(): Promise<Repository<T>> {
    const dataSource = await connectionManager.getDataSource();
      return new ProductRepository(dataSource);
    dataSource.
    if (dataSource !== undefined) {
      return dataSource;
    }
    const dataSource = await dataManager.getDataSource();
    return new ProductRepository(dataSource);
  };
}
