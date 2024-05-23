/* eslint-disable @typescript-eslint/naming-convention */
import config from 'config';
import { DependencyContainer } from 'tsyringe';
import { ArtifactRasterType, Domain } from '@map-colonies/types';
import { DataSource } from 'typeorm';
import httpStatusCodes from 'http-status-codes';
import { CreateExportTaskResponse, TaskEvent, TaskStatus } from '@map-colonies/export-interfaces';
import { TASK_REPOSITORY_SYMBOL, TaskRepository } from '../../../src/DAL/repositories/taskRepository';
import { TaskEntity } from '../../../src/DAL/entity';
import { registerContainerValues } from '../../configurations/integration/containerConfig';
import { mockExportTaskRequest } from '../../unit/helpers/helpers';
import { ExportManagerRaster } from '../../../src/exportManager/exportManagerRaster';
import { TasksManager } from '../../../src/task/models/tasksManager';
import { WebhooksRepository, WEBHOOKS_REPOSITORY_SYMBOL } from '../../../src/DAL/repositories/webhooksRepository';
import { insertMockCompletedTask, insertMockInProgressTask, insertMockPendingTask } from '../helpers/mockData';
import { IWebhookEntity } from '../../../src/DAL/models/webhooks';
import { TasksRequestSender } from './helpers/requestSender';

describe('tasks', function () {
  let requestSender: TasksRequestSender;
  let taskRepository: TaskRepository;
  let webhookRepository: WebhooksRepository;
  let depContainer: DependencyContainer;
  let saveSpy: jest.SpyInstance;
  let findOneSpy: jest.SpyInstance;
  let findSpy: jest.SpyInstance;
  let createExportTaskStub: jest.SpyInstance;
  let createNewTaskStub: jest.SpyInstance;
  let upsertWebhooksMockStub: jest.SpyInstance;
  beforeAll(async function () {
    const [app, container] = await registerContainerValues();
    requestSender = new TasksRequestSender(app);
    depContainer = container;
    taskRepository = depContainer.resolve(TASK_REPOSITORY_SYMBOL);
    webhookRepository = depContainer.resolve(WEBHOOKS_REPOSITORY_SYMBOL);
  });

  beforeEach(function () {
    createExportTaskStub = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
    createNewTaskStub = jest.spyOn(TasksManager.prototype as unknown as { createNewTask: jest.Mock }, 'createNewTask');
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
      it('should return 201 status code & create new task with the resource', async function () {
        const request = mockExportTaskRequest();
        const domainResponseMock: CreateExportTaskResponse = {
          jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
          taskGeometries: [],
        };

        createExportTaskStub.mockResolvedValue(domainResponseMock);

        const response = await requestSender.createTask(request);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(createNewTaskStub).toHaveBeenCalledTimes(1);
      });

      it('should return 201 status & create new COMPLETED task with the resource even if its not already exists in db', async function () {
        const request = mockExportTaskRequest();

        const domainResponseMock: CreateExportTaskResponse = {
          jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1831e',
          taskGeometries: [],
          status: TaskStatus.COMPLETED,
          expiredAt: new Date('2024-04-07T10:54:52.188Z'),
          progress: 100,
          artifacts: [
            { name: 'GPKG_TEST.gpkg', size: 343334, url: 'http://localhost:8080', type: ArtifactRasterType.GPKG, sha256: 'ft56hku7v5uijk6' },
          ],
        };

        createExportTaskStub.mockResolvedValue(domainResponseMock);

        const response = await requestSender.createTask(request);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(createNewTaskStub).toHaveBeenCalledTimes(1);
      });

      it('should return 201 status & create new IN_PROGRESS task with the resource even if its not already exists in db', async function () {
        const request = mockExportTaskRequest();

        const domainResponseMock: CreateExportTaskResponse = {
          jobId: '5f3c9e10-e6ed-4190-a08f-0bbf50d992bc',
          taskGeometries: [],
          status: TaskStatus.IN_PROGRESS,
          expiredAt: new Date('2024-04-07T10:54:52.188Z'),
          progress: 55,
        };

        createExportTaskStub.mockResolvedValue(domainResponseMock);

        const response = await requestSender.createTask(request);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(createNewTaskStub).toHaveBeenCalledTimes(1);
      });

      it('should return 201 status & create new PENDING task with the resource even if its not already exists in db', async function () {
        const request = mockExportTaskRequest();

        const domainResponseMock: CreateExportTaskResponse = {
          jobId: '5619880b-6386-4d6b-8675-f3969cb93d3e',
          taskGeometries: [],
          status: TaskStatus.PENDING,
          expiredAt: new Date('2024-04-07T10:54:52.188Z'),
          progress: 55,
        };

        createExportTaskStub.mockResolvedValue(domainResponseMock);

        const response = await requestSender.createTask(request);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(createNewTaskStub).toHaveBeenCalledTimes(1);
      });

      it('should return 201 status code & return the matched completed task by job id and customer name', async function () {
        const request = mockExportTaskRequest();
        await insertMockCompletedTask(taskRepository);

        const domainResponseMock: CreateExportTaskResponse = {
          jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1831e',
          taskGeometries: [],
          status: TaskStatus.COMPLETED,
          expiredAt: new Date('2024-04-07T10:54:52.188Z'),
          progress: 100,
          artifacts: [
            { name: 'GPKG_TEST.gpkg', size: 343334, url: 'http://localhost:8080', type: ArtifactRasterType.GPKG, sha256: 'ft56hku7v5uijk6' },
          ],
        };

        createExportTaskStub.mockResolvedValue(domainResponseMock);

        const response = await requestSender.createTask(request);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(createNewTaskStub).toHaveBeenCalledTimes(0);
      });

      it('should return 201 status code & create new webhook to the similar in-progress task', async function () {
        const request = mockExportTaskRequest();
        const findOneWebhookByStub = jest.spyOn(webhookRepository, 'findOneBy');
        const saveWebhookSpy = jest.spyOn(webhookRepository, 'save');
        await insertMockInProgressTask(taskRepository);

        findOneWebhookByStub.mockResolvedValue(null);
        const domainResponseMock: CreateExportTaskResponse = {
          jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1831d',
          taskGeometries: [],
          status: TaskStatus.IN_PROGRESS,
          expiredAt: new Date('2024-04-07T10:54:52.188Z'),
        };

        upsertWebhooksMockStub = jest.spyOn(webhookRepository, 'upsertWebhooks');
        createExportTaskStub.mockResolvedValue(domainResponseMock);

        const response = await requestSender.createTask(request);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(findOneWebhookByStub).toHaveBeenCalledTimes(1);
        expect(upsertWebhooksMockStub).toHaveBeenCalledTimes(1);
        expect(saveWebhookSpy).toHaveBeenCalledTimes(1);
        expect(createNewTaskStub).toHaveBeenCalledTimes(0);
      });

      it('should return 201 status code & create new webhook to the similar pending task', async function () {
        const request = mockExportTaskRequest();
        const findOneWebhookByStub = jest.spyOn(webhookRepository, 'findOneBy');
        const saveWebhookSpy = jest.spyOn(webhookRepository, 'save');
        await insertMockPendingTask(taskRepository);

        findOneWebhookByStub.mockResolvedValue(null);
        const domainResponseMock: CreateExportTaskResponse = {
          jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1831d',
          taskGeometries: [],
          status: TaskStatus.PENDING,
          expiredAt: new Date('2024-04-07T10:54:52.188Z'),
        };

        upsertWebhooksMockStub = jest.spyOn(webhookRepository, 'upsertWebhooks');
        createExportTaskStub.mockResolvedValue(domainResponseMock);

        const response = await requestSender.createTask(request);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(findOneWebhookByStub).toHaveBeenCalledTimes(1);
        expect(upsertWebhooksMockStub).toHaveBeenCalledTimes(1);
        expect(saveWebhookSpy).toHaveBeenCalledTimes(1);
        expect(createNewTaskStub).toHaveBeenCalledTimes(0);
      });

      it('should return 201 status code & update the webhook events for existing webhook url to the similar in-progress task', async function () {
        const request = mockExportTaskRequest();
        upsertWebhooksMockStub = jest.spyOn(webhookRepository, 'upsertWebhooks');
        const findOneWebhookByStub = jest.spyOn(webhookRepository, 'findOneBy');
        const updateWebhookStub = jest.spyOn(webhookRepository, 'update');
        const saveWebhookSpy = jest.spyOn(webhookRepository, 'save');
        const mockWebhook: IWebhookEntity = webhookRepository.create({ url: 'http://localhost:8080', events: [TaskEvent.TASK_FAILED], id: 1 });
        await insertMockInProgressTask(taskRepository);

        findOneWebhookByStub.mockResolvedValue(mockWebhook);
        const domainResponseMock: CreateExportTaskResponse = {
          jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1831d',
          taskGeometries: [],
          status: TaskStatus.IN_PROGRESS,
          expiredAt: new Date('2024-04-07T10:54:52.188Z'),
        };

        createExportTaskStub.mockResolvedValue(domainResponseMock);

        const response = await requestSender.createTask(request);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(findOneWebhookByStub).toHaveBeenCalledTimes(1);
        expect(updateWebhookStub).toHaveBeenCalledWith(1, { events: [TaskEvent.TASK_FAILED, TaskEvent.TASK_COMPLETED] });
        expect(upsertWebhooksMockStub).toHaveBeenCalledTimes(1);
        expect(saveWebhookSpy).toHaveBeenCalledTimes(0);
        expect(createNewTaskStub).toHaveBeenCalledTimes(0);
      });
    });

    describe('GET /export-tasks', function () {
      it('should return 200 status code and the resources by the limit number given', async function () {
        await insertMockPendingTask(taskRepository);

        const response = await requestSender.getLatestTasksByLimit(1);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.OK);
        expect(response.body).toHaveLength(1);
      });

      it('should return 200 status code and an empty array of results', async function () {
        await webhookRepository.delete({});
        await taskRepository.delete({});
        const response = await requestSender.getLatestTasksByLimit(1);

        expect(response).toSatisfyApiSpec();
        expect(response.status).toBe(httpStatusCodes.OK);
        expect(response.body).toHaveLength(0);
      });
    });

    describe('GET /export-tasks/:taskId', function () {
      describe('Happy Path', function () {
        it('should return 200 status code and the resource', async function () {
          const task = await insertMockPendingTask(taskRepository);

          const response = await requestSender.getTaskById(task.id);

          expect(response).toSatisfyApiSpec();
          expect(response.status).toBe(httpStatusCodes.OK);
          expect((response.body as unknown as TaskEntity).id).toBe(task.id);
        });
      });
    });

    describe('Bad Path', function () {
      describe('POST /export-tasks', function () {
        it('should return 400 status code due to unsupported domain', async function () {
          const request = mockExportTaskRequest();
          request.domain = Domain.DEM;
          const errMessage = `unsupported domain requested: "${request.domain}" - currently only "${Domain.RASTER}" domain is supported`;
          const response = await requestSender.createTask(request);

          expect(response).toSatisfyApiSpec();
          expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
          expect((response.body as { message: string }).message).toBe(errMessage);
        });
      });

      describe('GET /export-tasks/:taskId', function () {
        it('should return 404 status code if id is not exists', async function () {
          const response = await requestSender.getTaskById(150);

          expect(response).toSatisfyApiSpec();
          expect(response).toHaveProperty('status', httpStatusCodes.NOT_FOUND);
        });
      });

      describe('GET /export-tasks', function () {
        it('should return 400 status code if the requested limit is higher than the maximum possible tasks amount', async function () {
          const limit = config.get<number>('maxTasksNumber');
          const requestedLimit = 100;
          const errMessage = `requested limit ${requestedLimit} is higher than the maximum possible limit tasks number ${limit}`;
          const response = await requestSender.getLatestTasksByLimit(requestedLimit);

          expect(response).toSatisfyApiSpec();
          expect((response.body as { message: string }).message).toBe(errMessage);
        });
      });
    });

    describe('Sad Path', function () {
      describe('POST /export-tasks', function () {
        it('should return 500 status code if db throws an error', async function () {
          saveSpy = jest.spyOn(taskRepository, 'save');
          const request = mockExportTaskRequest();
          const domainResponseMock: CreateExportTaskResponse = {
            jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
            taskGeometries: [],
          };

          createExportTaskStub.mockResolvedValue(domainResponseMock);
          saveSpy.mockRejectedValue(new Error());

          const response = await requestSender.createTask(request);

          expect(response).toSatisfyApiSpec();
          expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
        });
      });

      describe('GET /export-tasks/:taskId', function () {
        it('should return 500 status code if db throws an error', async function () {
          findOneSpy = jest.spyOn(taskRepository, 'findOne');
          findOneSpy.mockRejectedValue(new Error());

          const response = await requestSender.getTaskById(1);

          expect(response).toSatisfyApiSpec();
          expect(findOneSpy).toHaveBeenCalledTimes(1);
          expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
        });
      });

      describe('GET /export-tasks', function () {
        it('should return 500 status code if db throws an error', async function () {
          findSpy = jest.spyOn(taskRepository, 'find');
          findSpy.mockRejectedValue(new Error());

          const response = await requestSender.getLatestTasksByLimit(1);

          expect(response).toSatisfyApiSpec();
          expect(response.status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
        });
      });
    });
  });
});
