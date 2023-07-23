import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { readFileSync } from 'fs';
import { SERVICES } from '../common/constants';
import { IConfig, IDbConfig } from '../common/interfaces';
import { ConnectionOptions, DataSource } from 'typeorm';
import { TaskEntity } from './entity/task';
import { ArtifactEntity } from './entity/artifact';
import { WebhookEntity } from './entity/webhook';
import { ArtifactTypeEntity } from './entity/artifactType';
import { TaskGeometryEntity } from './entity/taskGeometry';
import { DBConnectionError } from '../common/errors';

@injectable()
export class ConnectionManager {
  private dataSource: DataSource;
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, @inject(SERVICES.CONFIG) private readonly config: IConfig) {}

  public async getDataSource(): Promise<DataSource> {
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
