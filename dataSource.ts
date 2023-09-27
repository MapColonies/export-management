import { DataSource } from 'typeorm';

import config from 'config';
import { IDbConfig } from './src/common/interfaces';
import { createConnectionOptions } from './src/DAL/utils/createConnection';

const connectionOptions = config.get<IDbConfig>('typeOrm');

export const appDataSource = new DataSource({
  ...createConnectionOptions(connectionOptions),
  migrationsTableName: 'custom_migration_table',
  migrations: ['src/DAL/migrations/*.ts'],
});
