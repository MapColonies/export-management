// /// <reference types="jest-extended" />

import jsLogger from '@map-colonies/js-logger';
import { DependencyContainer, container, instanceCachingFactory } from 'tsyringe';
import { Domain } from '@map-colonies/types';
import { trace } from '@opentelemetry/api';
import { CreateExportTaskRequest, CreateExportTaskResponse, TaskEvent, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { DataSource, Repository } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '../../../src/app';
import { ITaskEntity } from '../../../src/DAL/models/task';
import { SERVICES } from '../../../src/common/constants';
import { TasksManager } from '../../../src/tasks/models/tasksManager';
import { TASK_REPOSITORY_SYMBOL, TaskRepository, taskRepositoryFactory } from '../../../src/DAL/repositories/taskRepository';
import { TaskEntity } from '../../../src/DAL/entity';
import { getFakeTask } from '../../utils/task';
import { geo1 } from '../../../src/exportManager/geoMocks';
import { TasksRequestSender } from './helpers/requestSender';

describe('tasks', function () {
  let requestSender: TasksRequestSender;
  let repo: TaskRepository;
  let depContainer: DependencyContainer;
  let tasksManager: TasksManager;
  let saveSpy: jest.SpyInstance;
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
    depContainer = container;
    tasksManager = depContainer.resolve(TasksManager);

  }, 70000);

  beforeEach(function () {
    repo = depContainer.resolve(TASK_REPOSITORY_SYMBOL);
    saveSpy = jest.spyOn(repo, 'save');
  });

  afterAll(async function () {
    await depContainer.resolve(DataSource).destroy();
  });

  afterEach(function () {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe(("GET /export-tasks"), function () {
    describe('Happy Path', function () {
      it('should return 201 status code and the resource', async function () {
        const req: CreateExportTaskRequest<TaskParameters> = {
          catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
          artifactCRS: '4326',
          domain: Domain.RASTER,
          webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }]
        }

        const response = await requestSender.createExportTask(req);

        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(1);
      });

      it('should return 201 status code and the cached resource', async function () {
        saveSpy = jest.spyOn(repo, 'save');
        const req: CreateExportTaskRequest<TaskParameters> = {
          catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
          artifactCRS: '4326',
          domain: Domain.RASTER,
          webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }]
        }

        const response = await requestSender.createExportTask(req);

        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(0);
        // TODO: uncomment next line when jobId will be implemented to test cached response.
        //expect(response.body).toMatchObject({status: TaskStatus.COMPLETED});
        //expect(response).toSatisfyApiSpec(); // TODO: use when tests are done
      });
    });

    describe('GET /export-tasks', function () {
      it('should return 200 status code and the resource', async function () {
        const res = await requestSender.getLatestTasksByLimit(1);

        expect(res).toHaveProperty('status', httpStatusCodes.OK);
        expect(JSON.parse(res.text)).toHaveLength(1);
        //expect(res).toSatisfyApiSpec();
        //expect(res.body).toMatchObject(bundles[0]);
      });
    });

    describe('GET /export-tasks:taskId', function () {
      it('should return 200 status code and the resource', async function () {
        const res = await requestSender.findOneEntity(1);

        expect(res).toHaveProperty('status', httpStatusCodes.OK);
        expect(JSON.parse(res.text)).toHaveLength(1);
        //expect(res).toSatisfyApiSpec();
        //expect(res.body).toMatchObject(bundles[0]);
      });
    });
    describe('Bad Path', function () {
      it('should return 400 status code due to unsupported domain', async function () {
        const req: CreateExportTaskRequest<TaskParameters> = {
          catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
          artifactCRS: '4326',
          domain: Domain.DEM,
          webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }]
        }
        const response = await requestSender.createExportTask(req);

        expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
        //expect(response).toSatisfyApiSpec(); // TODO: use when tests are done
      });
    });
    describe('Sad Path', function () {
      it('should return 500 status code if db throws an error', async function () {
        const findOneSpy = jest.spyOn(repo, 'findOne');
        const req: CreateExportTaskRequest<TaskParameters> = {
          catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
          artifactCRS: '4326',
          domain: Domain.RASTER,
          webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }]
        }
        findOneSpy.mockRejectedValue(new Error());
        
        const res = await requestSender.createExportTask(req);

        expect(res).toHaveProperty('status', httpStatusCodes.INTERNAL_SERVER_ERROR);
        //expect(res).toSatisfyApiSpec();
      });
    });
  })
});
