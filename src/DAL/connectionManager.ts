import { readFileSync } from 'fs';
import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { ConnectionOptions, DataSource } from 'typeorm';
import { HealthCheck } from '@godaddy/terminus';
import { SERVICES } from '../common/constants';
import { IConfig, IDbConfig } from '../common/interfaces';
import { DBConnectionError } from '../common/errors';
import { promiseTimeout } from '../common/utils';

@injectable()
export class ConnectionManager {
  private dataSource: DataSource;

  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, @inject(SERVICES.CONFIG) private readonly config: IConfig) {}

  public async initDataSource(): Promise<DataSource> {
    if (this.dataSource) {
      return this.dataSource;
    }

    const connectionConfig = this.config.get<IDbConfig>('typeOrm');
    try {
      this.dataSource = new DataSource(this.createConnectionOptions(connectionConfig));

      await this.dataSource.initialize();
      this.logger.info({
        msg: 'Successfully connected to db',
        metadata: { connectionConfig },
      });
      return this.dataSource;
    } catch (err) {
      this.logger.error({ msg: err, metadata: { err, connectionConfig } });
      throw new DBConnectionError();
    }
  }

  private createConnectionOptions(dbConfig: IDbConfig): ConnectionOptions {
    const { enableSslAuth, sslPaths, ...connectionOptions } = dbConfig;
    if (enableSslAuth) {
      connectionOptions.password = undefined;
      connectionOptions.ssl = { key: readFileSync(sslPaths.key), cert: readFileSync(sslPaths.cert), ca: readFileSync(sslPaths.ca) };
    }
    return connectionOptions;
  }
}
export const getDbHealthCheckFunction = (connection: DataSource): HealthCheck => {
  const dbTimeout = 5000;
  return async (): Promise<void> => {
    const check = connection.query('SELECT 1').then(() => {
      return;
    });
    return promiseTimeout<void>(dbTimeout, check);
  };
};
