import { hostname } from 'os';
import { readFileSync } from 'fs';
import { DataSource, DataSourceOptions } from 'typeorm';
import { IDbConfig } from '../../common/interfaces';
import { ArtifactEntity, TaskGeometryEntity, TaskEntity, WebhookEntity } from '../entity';

export const createConnectionOptions = (dbConfig: IDbConfig): DataSourceOptions => {
  const { enableSslAuth, sslPaths, ...dataSourceOptions } = dbConfig;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  dataSourceOptions.extra = { application_name: `${hostname()}-${process.env.NODE_ENV ?? 'unknown_env'}` };
  if (enableSslAuth) {
    dataSourceOptions.password = undefined;
    dataSourceOptions.ssl = { key: readFileSync(sslPaths.key), cert: readFileSync(sslPaths.cert), ca: readFileSync(sslPaths.ca) };
  }
  return {
    entities: [TaskEntity, ArtifactEntity, TaskGeometryEntity, WebhookEntity],
    migrationsTableName: 'custom_migration_table',
    ...dataSourceOptions,
    type: 'postgres',
  };
};

export const initConnection = async (dbConfig: IDbConfig): Promise<DataSource> => {
  const dataSource = new DataSource(createConnectionOptions(dbConfig));
  await dataSource.initialize();
  return dataSource;
};
