import { DataSource } from 'typeorm';

import { IDbConfig } from './src/common/interfaces';
import config from 'config';
import { createConnectionOptions } from './src/DAL/createConnection';

const connectionOptions = config.get<IDbConfig>('typeOrm');

export const appDataSource = new DataSource({
  ...createConnectionOptions(connectionOptions),
});
