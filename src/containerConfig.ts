import config from 'config';
import { getOtelMixin } from '@map-colonies/telemetry';
import { trace, metrics as OtelMetrics } from '@opentelemetry/api';
import { DependencyContainer } from 'tsyringe/dist/typings/types';
import jsLogger, { LoggerOptions } from '@map-colonies/js-logger';
import { DataSource } from 'typeorm';
import { Metrics } from '@map-colonies/telemetry';
import { SERVICES, SERVICE_NAME } from './common/constants';
import { TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL, entityRepositoryFactory } from './DAL/repositories/taskRepository';
import { tracing } from './common/tracing';
import { InjectionObject, registerDependencies } from './common/dependencyRegistration';
import { tasksRouterFactory, TASKS_ROUTER_SYMBOL } from './tasks/routes/tasksRouter';
import { ConnectionManager, getDbHealthCheckFunction } from './DAL/connectionManager';

export interface RegisterOptions {
  override?: InjectionObject<unknown>[];
  useChild?: boolean;
}

export const registerExternalValues = async (options?: RegisterOptions): Promise<DependencyContainer> => {
  const loggerConfig = config.get<LoggerOptions>('telemetry.logger');
  const logger = jsLogger({ ...loggerConfig, prettyPrint: loggerConfig.prettyPrint, mixin: getOtelMixin() });
  const dbConnectionManager = new ConnectionManager(logger, config);
  const dataSource = await dbConnectionManager.initDataSource();
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
      provider: { useFactory: (container): unknown => getDbHealthCheckFunction(container.resolve<DataSource>(DataSource)) },
    },
    { token: DataSource, provider: { useValue: dataSource } },
    { token: TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL, provider: { useFactory: entityRepositoryFactory } },
    
  ];

  return registerDependencies(dependencies, options?.override, options?.useChild);
};
