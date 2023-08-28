// /// <reference types="jest-extended" />

import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { TasksRequestSender } from './helpers/requestSender';
import { CreateExportTaskRequest, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { Domain } from '@map-colonies/types';
import { DependencyContainer } from 'tsyringe';
import { DataSource } from 'typeorm';

describe('tasks', function () {
  let requestSender: TasksRequestSender;
  let depContainer: DependencyContainer;
  beforeAll(async function () {
    console.log("SDAFASDFASFSD")
    const [app, container] = await getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
        
      ],
      useChild: true,
    });
    console.log("APPPPPPPPPPPPP", app)
    requestSender = new TasksRequestSender(app);
    depContainer = container;
  });

  afterEach(async function () {
    await depContainer.resolve(DataSource).destroy();
  });

  describe('Happy Path', function () {
    it.only('should return 200 status code and the resource', async function () {
      const req: CreateExportTaskRequest<TaskParameters> = {
       catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
       artifactCRS: '4326',
       domain: Domain.RASTER,
       webhook: [{url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED]}]
      }
      const response = await requestSender.createExportTask(req);

      expect(response.status).toBe(httpStatusCodes.CREATED);
      //expect(response).toSatisfyApiSpec(); // TODO: use when tests are done
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      expect(1 + 1).toBe(2);
    });
  });
  describe('Bad Path', function () {
    // All requests with status code of 400
  });
  describe('Sad Path', function () {
    // All requests with status code 4XX-5XX
  });
});
