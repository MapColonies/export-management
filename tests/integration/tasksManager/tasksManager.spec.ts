/* eslint-disable @typescript-eslint/naming-convention */
import config from 'config';
import jsLogger from '@map-colonies/js-logger';
import { DependencyContainer } from 'tsyringe';
import { Domain } from '@map-colonies/types';
import { trace } from '@opentelemetry/api';
import { DataSource } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '../../../src/app';
import { exportRequest } from '../../utils/exportRequest';
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
  });

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
        const req = { ...exportRequest };

        const response = await requestSender.createTask(req);
        console.log('response:', response)
        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(1);
      });

      it('should return 201 status code and the cached resource', async function () {
        saveSpy = jest.spyOn(repo, 'save');
        const req = { ...exportRequest };

        const response = await requestSender.createTask(req);

        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        //expect(response).toSatisfyApiSpec();
      });
    });

    describe('GET /export-tasks', function () {
      it('should return 200 status code and the resource', async function () {
        const response = await requestSender.getLatestTasksByLimit(1);
        
        expect(response.status).toBe(httpStatusCodes.OK);
        expect(response.body).toHaveLength(1);
        //expect(res).toSatisfyApiSpec();
      });

      it('should return 200 status code and an empty array', async function () {
        findSpy.mockResolvedValue([]);
        const response = await requestSender.getLatestTasksByLimit(1);

        expect(findSpy).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(httpStatusCodes.OK);
        expect(response.body).toHaveLength(0);
        //expect(res).toSatisfyApiSpec();
      });
    });

    describe('GET /export-tasks/:taskId', function () {
      describe('Happy Path', function () {
        it('should return 200 status code and the resource', async function () {
          // task entity setup for get by id test
          const req = { ...exportRequest };
          const res = await requestSender.createTask(req);
          const entity = res.body as TaskEntity;
          const response = await requestSender.getTaskById(entity.id);

          expect(response.status).toBe(httpStatusCodes.OK);
          expect((response.body as unknown as TaskEntity).id).toBe(entity.id);
          //expect(res).toSatisfyApiSpec();
        });
      });
    });

    describe('Bad Path', function () {
      describe('POST /export-tasks', function () {
        it('should return 400 status code due to unsupported domain', async function () {
          const req = { ...exportRequest };
          req.domain = Domain.DEM;
          const errMessage = `unsupported domain requested: "${req.domain}" - currently only "${Domain.RASTER}" domain is supported`;

          const response = await requestSender.createTask(req);

          expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
          expect((response.body as {message: string}).message).toBe(errMessage);
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

      describe('GET /export-tasks', function () {
        it('should return 400 status code if the requested limit is higher than the maximum possible tasks amount', async function () {
          const limit = config.get<number>('maxTasksNumber');
          const requestedLimit = 100;
          const errMessage = `requested limit ${requestedLimit} is higher than the maximum possible limit tasks number ${limit}`;
          const response = await requestSender.getLatestTasksByLimit(requestedLimit);
          
          expect((response.body as {message: string}).message).toBe(errMessage);
          //expect(res).toSatisfyApiSpec();
        });
      });
    });

    describe('Sad Path', function () {
      describe('POST /export-tasks', function () {
        it('should return 500 status code if db throws an error', async function () {
          const req = { ...exportRequest };
          saveSpy.mockRejectedValue(new Error());

          const response = await requestSender.createTask(req);

          expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
          //expect(res).toSatisfyApiSpec();
        });
      });

      describe('GET /export-tasks/:taskId', function () {
        it('should return 500 status code if db throws an error', async function () {
          findOneSpy.mockRejectedValue(new Error());

          const response = await requestSender.getTaskById(1);

          expect(findOneSpy).toHaveBeenCalledTimes(1);
          expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
          //expect(res).toSatisfyApiSpec();
        });
      });

      describe('GET /export-tasks', function () {
        it('should return 500 status code if db throws an error', async function () {
          findSpy.mockRejectedValue(new Error());

          const response = await requestSender.getLatestTasksByLimit(1);

          expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
          //expect(res).toSatisfyApiSpec();
        });
      });
    });
  });
});
