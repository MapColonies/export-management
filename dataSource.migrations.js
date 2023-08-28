const { DataSource } = require('typeorm');
const config = require('config');
const { createConnectionOptions } = require('./src/DAL/utils/createConnection');

/**
 * @type {import("./src/db/types").DbConfig}
 */
const connectionOptions = config.get('typeOrm');

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const appDataSource = new DataSource({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  ...createConnectionOptions(connectionOptions),
});

module.exports = { appDataSource };