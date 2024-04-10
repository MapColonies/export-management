import config from 'config';
import { getOtelMixin } from '@map-colonies/telemetry';
import { trace, metrics as OtelMetrics } from '@opentelemetry/api';
import { DependencyContainer } from 'tsyringe/dist/typings/types';
import jsLogger, { LoggerOptions } from '@map-colonies/js-logger';
import { DataSource } from 'typeorm';
import { Metrics } from '@map-colonies/telemetry';
import { instanceCachingFactory } from 'tsyringe';
import { HealthCheck } from '@godaddy/terminus';
import { DB_CONNECTION_TIMEOUT, SERVICES, SERVICE_NAME } from './common/constants';
import { TASK_REPOSITORY_SYMBOL, taskRepositoryFactory } from './DAL/repositories/taskRepository';
import { tracing } from './common/tracing';
import { InjectionObject, registerDependencies } from './common/dependencyRegistration';
import { tasksRouterFactory, TASKS_ROUTER_SYMBOL } from './task/routes/tasksRouter';
import { initConnection } from './DAL/utils/createConnection';
import { IDbConfig } from './common/interfaces';
import { promiseTimeout } from './common/utils';
import { ARTIFACT_REPOSITORY_SYMBOL, artifactRepositoryFactory } from './DAL/repositories/artifactRepository';
import { WEBHOOKS_REPOSITORY_SYMBOL, webhooksRepositoryFactory } from './DAL/repositories/webhooksRepository';

const healthCheck = (connection: DataSource): HealthCheck => {
  return async (): Promise<void> => {
    const check = connection.query('SELECT 1').then(() => {
      return;
    });
    return promiseTimeout<void>(DB_CONNECTION_TIMEOUT, check);
  };
};

export interface RegisterOptions {
  override?: InjectionObject<unknown>[];
  useChild?: boolean;
}

export const registerExternalValues = async (options?: RegisterOptions): Promise<DependencyContainer> => {
  const loggerConfig = config.get<LoggerOptions>('telemetry.logger');
  const logger = jsLogger({ ...loggerConfig, prettyPrint: loggerConfig.prettyPrint, mixin: getOtelMixin() });

  const connectionOptions = config.get<IDbConfig>('typeOrm');
  const connection = await initConnection(connectionOptions);

  const metrics = new Metrics();
  metrics.start();

  tracing.start();
  const tracer = trace.getTracer(SERVICE_NAME);

  const dependencies: InjectionObject<unknown>[] = [
    { token: SERVICES.CONFIG, provider: { useValue: config } },
    { token: SERVICES.LOGGER, provider: { useValue: logger } },
    { token: SERVICES.TRACER, provider: { useValue: tracer } },
    { token: SERVICES.METER, provider: { useValue: OtelMetrics.getMeterProvider().getMeter(SERVICE_NAME) } },
    { token: TASKS_ROUTER_SYMBOL, provider: { useFactory: tasksRouterFactory } },
    { token: DataSource, provider: { useValue: connection } },
    {
      token: 'onSignal',
      provider: {
        useValue: {
          useValue: async (): Promise<void> => {
            await Promise.all([tracing.stop(), metrics.stop()]);
          },
        },
      },
    },
    {
      token: SERVICES.HEALTH_CHECK,
      provider: {
        useFactory: instanceCachingFactory((container) => {
          const connection = container.resolve(DataSource);
          return healthCheck(connection);
        }),
      },
    },
    { token: TASK_REPOSITORY_SYMBOL, provider: { useFactory: instanceCachingFactory((c) => taskRepositoryFactory(c)) } },
    { token: ARTIFACT_REPOSITORY_SYMBOL, provider: { useFactory: instanceCachingFactory((c) => artifactRepositoryFactory(c)) } },
    { token: WEBHOOKS_REPOSITORY_SYMBOL, provider: { useFactory: instanceCachingFactory((c) => webhooksRepositoryFactory(c)) } },
  ];

  return registerDependencies(dependencies, options?.override, options?.useChild);
};
