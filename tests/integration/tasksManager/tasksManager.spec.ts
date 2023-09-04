// /// <reference types="jest-extended" />

import jsLogger from '@map-colonies/js-logger';
import { DependencyContainer, container } from 'tsyringe';
import { Domain } from '@map-colonies/types';
import { trace } from '@opentelemetry/api';
import { CreateExportTaskRequest, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { DataSource, Repository } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { TasksRequestSender } from './helpers/requestSender';
import { TasksManager } from '../../../src/tasks/models/tasksManager';
import { TaskRepository } from '../../../src/DAL/repositories/taskRepository';
import { TaskEntity } from '../../../src/DAL/entity';
import { getFakeTask } from '../../utils/task';

describe('tasks', function () {
  let requestSender: TasksRequestSender;
  let tasksRepository: Repository<TaskEntity>;
  const task = getFakeTask();
  beforeAll(async function () {
    const [app, container] = await getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
        
      ],
      useChild: true,
    });
    requestSender = new TasksRequestSender(app);
    tasksRepository = container.resolve(DataSource).getRepository(TaskEntity);
    await container.resolve(DataSource).getRepository(TaskEntity).save(task);
  }, 70000);

  afterEach(async function () {
    await container.resolve(DataSource).destroy();
  });
  
  describe(("GET /export-tasks"), function () {
    describe('Happy Path', function () {
      it('should return 201 status code and the resource', async function () {
        const findOneSpy = jest.spyOn(tasksRepository, 'findOne');
        const saveSpy = jest.spyOn(tasksRepository, 'save');

        const req: CreateExportTaskRequest<TaskParameters> = {
         catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
         artifactCRS: '4326',
         domain: Domain.RASTER,
         webhook: [{url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED]}]
        }

        findOneSpy.mockResolvedValue(null);
        const response = await requestSender.createExportTask(req);
  
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        //expect(response).toSatisfyApiSpec(); // TODO: use when tests are done
      });

      it('should return 201 status code and the cached resource', async function () {
        const saveSpy = jest.spyOn(tasksRepository, 'save');
        const req: CreateExportTaskRequest<TaskParameters> = {
         catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
         artifactCRS: '4326',
         domain: Domain.RASTER,
         webhook: [{url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED]}]
        }

        const response = await requestSender.createExportTask(req);
        expect(saveSpy).not.toHaveBeenCalled();
  
        expect(response.status).toBe(httpStatusCodes.CREATED);
        //expect(response).toSatisfyApiSpec(); // TODO: use when tests are done
      });
    });
    describe('Bad Path', function () {
      // All requests with status code of 400
    });
    describe('Sad Path', function () {
      // All requests with status code 4XX-5XX
    });
  })

});
