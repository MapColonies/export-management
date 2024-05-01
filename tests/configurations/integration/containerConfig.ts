import { trace } from '@opentelemetry/api';
import jsLogger from '@map-colonies/js-logger';
import { container, DependencyContainer, instanceCachingFactory } from 'tsyringe';
import { Application } from 'express';
import { InjectionObject } from '../../../src/common/dependencyRegistration';
import { SERVICES } from '../../../src/common/constants';
import { getApp } from '../../../src/app';
import { webhooksRepositoryFactory, WEBHOOKS_REPOSITORY_SYMBOL } from '../../../src/DAL/repositories/webhooksRepository';

export const registerContainerValues = async (): Promise<[Application, DependencyContainer]> => {
  return getApp({
    override: [
      { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
      { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
    ],
    useChild: true,
  });
};
