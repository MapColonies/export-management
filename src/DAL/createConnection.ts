import { readFileSync } from 'fs';
import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { DataSource, DataSourceOptions } from 'typeorm';
import { HealthCheck } from '@godaddy/terminus';
import { SERVICES } from '../common/constants';
import { IConfig, IDbConfig } from '../common/interfaces';
import { DBConnectionError } from '../common/errors';
import { promiseTimeout } from '../common/utils';

export const initConnection = async (dbConfig: IDbConfig): Promise<DataSource> => {
  try {
    const dataSource = new DataSource(createConnectionOptions(dbConfig));
    await dataSource.initialize();
    return dataSource;
  } catch (err) {
    throw new DBConnectionError();
  }
};

export const createConnectionOptions = (dbConfig: IDbConfig): DataSourceOptions => {
  const { enableSslAuth, sslPaths, ...connectionOptions } = dbConfig;
  if (enableSslAuth) {
    connectionOptions.password = undefined;
    connectionOptions.ssl = { key: readFileSync(sslPaths.key), cert: readFileSync(sslPaths.cert), ca: readFileSync(sslPaths.ca) };
  }
  return connectionOptions;
};
