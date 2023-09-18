/* eslint-disable import/first */
// this import must be called before the first import of tsyringe
import 'reflect-metadata';
import { createServer } from 'http';
import { createTerminus } from '@godaddy/terminus';
import { Logger } from '@map-colonies/js-logger';
import { DependencyContainer } from 'tsyringe';
import config from 'config';
import { DEFAULT_SERVER_PORT, SERVICES } from './common/constants';

import { getApp } from './app';

let depContainer: DependencyContainer | undefined;

const port: number = config.get<number>('server.port') || DEFAULT_SERVER_PORT;

void getApp()
  .then(([app, container]) => {
    depContainer = container;

    const logger = container.resolve<Logger>(SERVICES.LOGGER);
    const server = createTerminus(createServer(app), {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      healthChecks: { '/liveness': container.resolve(SERVICES.HEALTH_CHECK) },
      onSignal: container.resolve('onSignal'),
    });

    server.listen(port, () => {
      logger.info(`app started on port ${port}`);
    });
  })
  .catch(async (error: Error) => {
    const errorLogger =
      depContainer?.isRegistered(SERVICES.LOGGER) == true
        ? depContainer.resolve<Logger>(SERVICES.LOGGER).error.bind(depContainer.resolve<Logger>(SERVICES.LOGGER))
        : console.error;
    errorLogger({ msg: '😢 - failed initializing the server', err: error });

    if (depContainer?.isRegistered(SERVICES.HEALTH_CHECK) == true) {
      const shutDown: () => Promise<void> = depContainer.resolve(SERVICES.HEALTH_CHECK);
      await shutDown();
    }
  });
