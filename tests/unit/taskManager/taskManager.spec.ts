import jsLogger from '@map-colonies/js-logger';
import { ArtifactRasterType, Domain } from '@map-colonies/types';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { CreateExportTaskResponse, TaskStatus } from '@map-colonies/export-interfaces/';
import { mockExportTaskRequest } from '../helpers/helpers';
import { ExportManagerRaster } from '../../../src/exportManager/exportManagerRaster';
import { TasksManager } from '../../../src/task/models/tasksManager';
import {
  createTaskMock,
  getLatestTasksByLimitMock,
  getTaskByIdMock,
  taskRepositoryMock,
  getCustomerTaskByJobIdMock,
  saveTaskMock,
} from '../../mocks/repositories/taskRepository.spec';
import { webhooksRepositoryMock, upsertWebhooksMock } from '../../mocks/repositories/webhooksRepository.spec';
import { mockTask } from '../../utils/task';

let taskManager: TasksManager;
let createExportTaskStub: jest.SpyInstance;
let createNewTaskStub: jest.SpyInstance;
describe('taskManager', () => {
  beforeEach(() => {
    createExportTaskStub = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
    createNewTaskStub = jest.spyOn(TasksManager.prototype as unknown as { createNewTask: jest.Mock }, 'createNewTask');
    taskManager = new TasksManager(jsLogger({ enabled: false }), taskRepositoryMock, webhooksRepositoryMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('#createTask', () => {
    it('resolves without errors and create new task', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
      };

      saveTaskMock.mockResolvedValue({ id: 1 });
      createExportTaskStub.mockResolvedValue(domainResponseMock);

      const action = async () => taskManager.createTask(request);

      await expect(action()).resolves.not.toThrow();
      expect(createNewTaskStub).toHaveBeenCalledTimes(1);
    });

    it('resolves without errors and return completed task with artifacts', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
        status: TaskStatus.COMPLETED,
        expiredAt: new Date('2024-04-07T10:54:52.188Z'),
        progress: 100,
        artifacts: [
          { name: 'GPKG_TEST.gpkg', size: 343334, url: 'http://localhost:8080', type: ArtifactRasterType.GPKG, sha256: 'sdfsdfasdfasfasdf' },
        ],
      };

      getCustomerTaskByJobIdMock.mockResolvedValue(mockTask);
      createExportTaskStub.mockResolvedValue(domainResponseMock);

      const res = await taskManager.createTask(request);

      expect(res).toHaveProperty('artifacts');
      expect(res.artifacts).toStrictEqual(domainResponseMock.artifacts);
      expect(res.status).toEqual(TaskStatus.COMPLETED);
      expect(res.progress).toBe(100);
      expect(createNewTaskStub).not.toHaveBeenCalled();
    });

    it('resolves without errors and update pending task with the relevant webhooks', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
        status: TaskStatus.PENDING,
        expiredAt: new Date('2024-04-07T10:54:52.188Z'),
      };

      getCustomerTaskByJobIdMock.mockResolvedValue({ ...mockTask, status: TaskStatus.PENDING });

      createExportTaskStub.mockResolvedValue(domainResponseMock);

      const res = await taskManager.createTask(request);

      expect(res.status).toEqual(TaskStatus.PENDING);
      expect(upsertWebhooksMock).toHaveBeenCalledTimes(1);
      expect(createNewTaskStub).not.toHaveBeenCalled();
    });

    it('resolves without errors and update in-progress task with the relevant webhooks', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
        status: TaskStatus.IN_PROGRESS,
        expiredAt: new Date('2024-04-07T10:54:52.188Z'),
      };

      getCustomerTaskByJobIdMock.mockResolvedValue({ ...mockTask, status: TaskStatus.IN_PROGRESS });
      createExportTaskStub.mockResolvedValue(domainResponseMock);

      const res = await taskManager.createTask(request);

      expect(res.status).toEqual(TaskStatus.IN_PROGRESS);
      expect(upsertWebhooksMock).toHaveBeenCalledTimes(1);
      expect(createNewTaskStub).not.toHaveBeenCalled();
    });

    it('resolves without errors and save task even if get customer task by job id returns as undefined', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
        status: TaskStatus.PENDING,
      };

      saveTaskMock.mockResolvedValue({ id: 1 });
      getCustomerTaskByJobIdMock.mockResolvedValue(undefined);
      createExportTaskStub.mockResolvedValue(domainResponseMock);

      const action = async () => taskManager.createTask(request);

      await expect(action()).resolves.not.toThrow();
      expect(createNewTaskStub).toHaveBeenCalledTimes(1);
    });

    it('rejects with bad request error due to unsupported domain "DEM"', async () => {
      const request = mockExportTaskRequest();
      request.domain = Domain.DEM;

      createTaskMock.mockResolvedValue(undefined);

      const createPromise = taskManager.createTask(request);

      await expect(createPromise).rejects.toThrow(BadRequestError);
      expect(createTaskMock).not.toHaveBeenCalled();
    });

    it('rejects with bad request error due to unsupported domain "3D"', async () => {
      const request = mockExportTaskRequest();
      request.domain = Domain._3D;

      createTaskMock.mockResolvedValue(undefined);

      const createPromise = taskManager.createTask(request);

      await expect(createPromise).rejects.toThrow(BadRequestError);
      expect(createTaskMock).not.toHaveBeenCalled();
    });

    it('rejects with bad request error due to any other unsupported domain value', async () => {
      const request = mockExportTaskRequest();
      request.domain = 'test_domain' as unknown as Domain;

      createTaskMock.mockResolvedValue(undefined);

      const createPromise = taskManager.createTask(request);

      await expect(createPromise).rejects.toThrow(BadRequestError);
      expect(createTaskMock).not.toHaveBeenCalled();
    });

    it('resolves and call with the received task geometries and estimations', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
        expiredAt: new Date('2024-04-07T10:54:52.188Z'),
      };

      request.domain = Domain.RASTER;

      const getEstimationsSpy = jest.spyOn(ExportManagerRaster.prototype, 'getEstimations');

      saveTaskMock.mockResolvedValue({ id: 1 });
      createExportTaskStub.mockResolvedValue(domainResponseMock);

      const action = async () => taskManager.createTask(request);

      await expect(action()).resolves.not.toThrow();
      expect(getEstimationsSpy).toHaveBeenCalledTimes(1);
      expect(createNewTaskStub).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(createNewTaskStub.mock.calls[0][2]).toStrictEqual(domainResponseMock);
    });

    it('resolves and call with the received customer name', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
        expiredAt: new Date('2024-04-07T10:54:52.188Z'),
      };
      request.domain = Domain.RASTER;

      const createExportTaskStub = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
      const customerName = 'customer_name';

      saveTaskMock.mockResolvedValue({ id: 1 });
      createExportTaskStub.mockResolvedValue(domainResponseMock);
      createNewTaskStub.mockResolvedValue(request);

      const action = async () => taskManager.createTask(request, customerName);

      await expect(action()).resolves.not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(createNewTaskStub.mock.calls[0][3]).toStrictEqual(customerName);
    });

    it('resolves and call with the default customer name if not given', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
        expiredAt: new Date('2024-04-07T10:54:52.188Z'),
      };
      request.domain = Domain.RASTER;
      const defaultCustomerName = 'unknown';

      const createExportTaskStub = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');

      saveTaskMock.mockResolvedValue({ id: 1 });
      createExportTaskStub.mockResolvedValue(domainResponseMock);
      createNewTaskStub.mockResolvedValue(request);

      const action = async () => taskManager.createTask(request);

      await expect(action()).resolves.not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(createNewTaskStub.mock.calls[0][3]).toStrictEqual(defaultCustomerName);
    });
  });

  describe('#getTaskById', () => {
    it('resolves and find exists request', async () => {
      const request = mockExportTaskRequest();

      getTaskByIdMock.mockResolvedValue(request);

      const findPromise = taskManager.getTaskById(1);

      await expect(findPromise).resolves.not.toThrow();
      await expect(findPromise).resolves.toStrictEqual(request);
    });

    it('resolves with not found error if task id is not exists', async () => {
      getTaskByIdMock.mockResolvedValue(undefined);

      const findPromise = taskManager.getTaskById(1);

      await expect(findPromise).rejects.toThrow(NotFoundError);
    });
  });

  describe('#getLatestTasksByLimit', () => {
    it('resolves and returns all task amount by requested limit if its lower than the max configured limit', async () => {
      const request = mockExportTaskRequest();
      const tasks = [request];

      getLatestTasksByLimitMock.mockResolvedValue(tasks);

      const action = async () => taskManager.getLatestTasksByLimit(10);

      await expect(action()).resolves.not.toThrow();
      await expect(action()).resolves.toStrictEqual(tasks);
    });

    it('rejects and throws bad requests error if requested limit is higher than the max configured limit', async () => {
      const request = mockExportTaskRequest();

      getLatestTasksByLimitMock.mockResolvedValue(request);

      const action = async () => taskManager.getLatestTasksByLimit(11);

      await expect(action()).rejects.toThrow(BadRequestError);
    });
  });
});
