import config from 'config';
import { IDbConfig } from '../../../src/common/interfaces';
import { initConnection } from '../../../src/DAL/utils/createConnection';

export default async (): Promise<void> => {
  const dataSourceOptions = config.get<IDbConfig>('typeOrm');
  const connection = await initConnection({
    ...dataSourceOptions,
    migrationsTableName: 'custom_migration_table',
    migrations: ['src/DAL/migrations/*.ts'],
  });
  // it is not allowed to use parameters for create commands in postgresql :(
  if (dataSourceOptions.schema != undefined) {
    await connection.query(`DROP SCHEMA IF EXISTS ${dataSourceOptions.schema} CASCADE`);
  }
  await connection.query(`CREATE SCHEMA IF NOT EXISTS ${dataSourceOptions.schema ?? 'public'}`);
  await connection.runMigrations({ transaction: 'all' });
  await connection.destroy();
};
