import { trace } from '@opentelemetry/api';
import jsLogger from '@map-colonies/js-logger';
import { DependencyContainer } from 'tsyringe';
import { Application } from 'express';
import { SERVICES } from '../../../src/common/constants';
import { getApp } from '../../../src/app';

export const registerContainerValues = async (): Promise<[Application, DependencyContainer]> => {
  return getApp({
    override: [
      { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
      { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
    ],
    useChild: true,
  });
};
