/* eslint-disable import/first */
// this import must be called before the first import of tsyringe
import 'reflect-metadata';
import { createServer } from 'http';
import { createTerminus, HealthCheck } from '@godaddy/terminus';
import { Logger } from '@map-colonies/js-logger';
import config from 'config';
import { DEFAULT_SERVER_PORT, SERVICES } from './common/constants';

import { getApp } from './app';
import { WorkerManager } from '@map-colonies/chameleon-mq/dist/worker';
import { workerJobHandler } from './queue/worker';
import { ConnectionOptions } from '@map-colonies/chameleon-mq/dist/connection';
import { publish } from './queue/queue';

const port: number = config.get<number>('server.port') || DEFAULT_SERVER_PORT;

void getApp()
  .then(([app, container]) => {
    const logger = container.resolve<Logger>(SERVICES.LOGGER);
    const healthCheck = container.resolve<HealthCheck>(SERVICES.HEALTH_CHECK);
    const connectionOptions: ConnectionOptions = { host: config.get<string>('queue.connection.host'), port: config.get<number>('queue.connection.port')}
    const topic = config.get<string>('queue.topic');
    const worker = new WorkerManager(topic, workerJobHandler, connectionOptions);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const server = createTerminus(createServer(app), { healthChecks: { '/liveness': healthCheck, onSignal: container.resolve('onSignal') } });
    
    server.listen(port, () => {
      void worker.subscribe();
      logger.info(`app started on port ${port}`);
    });
  })
  .catch((error: Error) => {
    console.error('😢 - failed to initialize the server');
    console.error(error.message);
  });