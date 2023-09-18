import jsLogger from '@map-colonies/js-logger';
import { DependencyContainer } from 'tsyringe';
import { Domain } from '@map-colonies/types';
import { trace } from '@opentelemetry/api';
import { CreateExportTaskRequest, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { DataSource } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { TASK_REPOSITORY_SYMBOL, TaskRepository } from '../../../src/DAL/repositories/taskRepository';
import { TaskEntity } from '../../../src/DAL/entity';
import { TasksRequestSender } from './helpers/requestSender';

describe('tasks', function () {
  let requestSender: TasksRequestSender;
  let repo: TaskRepository;
  let depContainer: DependencyContainer;
  let saveSpy: jest.SpyInstance;
  let findOneSpy: jest.SpyInstance;
  let findSpy: jest.SpyInstance;
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
    repo = depContainer.resolve(TASK_REPOSITORY_SYMBOL);
  }, 70000);

  beforeEach(function () {
    saveSpy = jest.spyOn(repo, 'save');
    findOneSpy = jest.spyOn(repo, 'findOne');
    findSpy = jest.spyOn(repo, 'find');
  });

  afterAll(async function () {
    await depContainer.resolve(DataSource).destroy();
  });

  afterEach(function () {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('Happy Path', function () {
    describe('POST /export-tasks', function () {
      it('should return 201 status code and the resource', async function () {
        const req: CreateExportTaskRequest<TaskParameters> = {
          catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
          artifactCRS: '4326',
          domain: Domain.RASTER,
          webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }],
        };

        const response = await requestSender.createTask(req);

        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        //expect(response).toSatisfyApiSpec();
      });

      it('should return 201 status code and the cached resource', async function () {
        saveSpy = jest.spyOn(repo, 'save');
        const req: CreateExportTaskRequest<TaskParameters> = {
          catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
          artifactCRS: '4326',
          domain: Domain.RASTER,
          webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }],
        };

        const response = await requestSender.createTask(req);

        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(0);
        //expect(response).toSatisfyApiSpec();
      });
    });

    describe('GET /export-tasks', function () {
      it('should return 200 status code and the resource', async function () {
        const res = await requestSender.getLatestTasksByLimit(1);

        expect(res).toHaveProperty('status', httpStatusCodes.OK);
        expect(JSON.parse(res.text)).toHaveLength(1);
        //expect(res).toSatisfyApiSpec();
      });

      it('should return 200 status code and an empty array', async function () {
        findSpy.mockResolvedValue([]);

        const res = await requestSender.getLatestTasksByLimit(1);

        expect(findSpy).toHaveBeenCalledTimes(1);
        expect(res).toHaveProperty('status', httpStatusCodes.OK);
        expect(JSON.parse(res.text)).toHaveLength(0);
        //expect(res).toSatisfyApiSpec();
      });
    });

    describe('GET /export-tasks/:taskId', function () {
      describe('Happy Path', function () {
        it('should return 200 status code and the resource', async function () {
          const res = await requestSender.getTaskById(1);

          expect(res).toHaveProperty('status', httpStatusCodes.OK);
          expect((res.body as unknown as TaskEntity).id).toBe(1);
          //expect(res).toSatisfyApiSpec();
        });
      });
    });

    describe('Bad Path', function () {
      describe('POST /export-tasks', function () {
        it('should return 400 status code due to unsupported domain', async function () {
          const req: CreateExportTaskRequest<TaskParameters> = {
            catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
            artifactCRS: '4326',
            domain: Domain.DEM,
            webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }],
          };
          const response = await requestSender.createTask(req);

          expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
          //expect(response).toSatisfyApiSpec(); // TODO: use when tests are done
        });
      });

      describe('GET /export-tasks/:taskId', function () {
        it('should return 404 status code if id is not exists', async function () {
          const res = await requestSender.getTaskById(150);

          expect(res).toHaveProperty('status', httpStatusCodes.NOT_FOUND);
          //expect(res).toSatisfyApiSpec();
        });
      });
    });

    describe('Sad Path', function () {
      describe('POST /export-tasks', function () {
        it('should return 500 status code if db throws an error', async function () {
          const req: CreateExportTaskRequest<TaskParameters> = {
            catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
            artifactCRS: '4326',
            domain: Domain.RASTER,
            webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }],
          };
          findOneSpy.mockRejectedValue(new Error());

          const res = await requestSender.createTask(req);

          expect(res).toHaveProperty('status', httpStatusCodes.INTERNAL_SERVER_ERROR);
          //expect(res).toSatisfyApiSpec();
        });
      });

      describe('GET /export-tasks/:taskId', function () {
        it('should return 500 status code if db throws an error', async function () {
          findOneSpy.mockRejectedValue(new Error());

          const res = await requestSender.getTaskById(1);

          expect(findOneSpy).toHaveBeenCalledTimes(1);
          expect(res).toHaveProperty('status', httpStatusCodes.INTERNAL_SERVER_ERROR);
          //expect(res).toSatisfyApiSpec();
        });
      });

      describe('GET /export-tasks', function () {
        it('should return 500 status code if db throws an error', async function () {
          findSpy.mockRejectedValue(new Error());

          const res = await requestSender.getLatestTasksByLimit(1);

          expect(res).toHaveProperty('status', httpStatusCodes.INTERNAL_SERVER_ERROR);
          //expect(res).toSatisfyApiSpec();
        });
      });
    });
  });
});
