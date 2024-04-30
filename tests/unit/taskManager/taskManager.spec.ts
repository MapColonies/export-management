import jsLogger from '@map-colonies/js-logger';
import { ArtifactRasterType, Domain } from '@map-colonies/types';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { CreateExportTaskResponse, GetEstimationsResponse, TaskStatus } from '@map-colonies/export-interfaces/';
import { mockExportTaskRequest } from '../helpers/helpers';
import { geo1 } from '../../../src/exportManager/geoMocks';
import { ExportManagerRaster } from '../../../src/exportManager/exportManagerRaster';
import { TasksManager } from '../../../src/task/models/tasksManager';
import { createTaskMock, getLatestTasksByLimitMock, getTaskByIdMock, taskRepositoryMock, getCustomerTaskByJobIdMock, saveTaskMock } from '../../mocks/repositories/taskRepository.spec';
import { webhooksRepositoryMock, upsertWebhooksMock} from '../../mocks/repositories/webhooksRepository.spec';
import { mockTask } from '../../utils/task';
import * as utils from '../../../src/exportManager/utils';

let taskManager: TasksManager;
let exportManagerInstanceStub: jest.SpyInstance;
let createNewTaskStub: jest.SpyInstance;
describe('taskManager', () => {
  beforeEach(() => {
    exportManagerInstanceStub = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
    createNewTaskStub = jest.spyOn(TasksManager.prototype as unknown as { createNewTask: jest.Mock }, 'createNewTask');
    taskManager = new TasksManager(jsLogger({ enabled: false }), taskRepositoryMock, webhooksRepositoryMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  describe('#createTask', () => {
    it('resolves without errors and create new task', async () => {

      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: []
      };

      saveTaskMock.mockResolvedValue({ id: 1 });
      exportManagerInstanceStub.mockResolvedValue(domainResponseMock);

      const action = async() => taskManager.createTask(request);

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
      exportManagerInstanceStub.mockResolvedValue(domainResponseMock);

      const res = await taskManager.createTask(request);

      expect(res).toHaveProperty("artifacts");
      expect(res.artifacts).toStrictEqual(domainResponseMock.artifacts);
      expect(res.status).toEqual(TaskStatus.COMPLETED);
      expect(res.progress).toBe(100)
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

      getCustomerTaskByJobIdMock.mockResolvedValue({...mockTask, status: TaskStatus.PENDING});
      exportManagerInstanceStub.mockResolvedValue(domainResponseMock);

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

      getCustomerTaskByJobIdMock.mockResolvedValue({...mockTask, status: TaskStatus.IN_PROGRESS});
      exportManagerInstanceStub.mockResolvedValue(domainResponseMock);

      const res = await taskManager.createTask(request);

      expect(res.status).toEqual(TaskStatus.IN_PROGRESS);
      expect(upsertWebhooksMock).toHaveBeenCalledTimes(1);
      expect(createNewTaskStub).not.toHaveBeenCalled();
    });

    it('throw not found error due to not exists task', async () => {
      const request = mockExportTaskRequest();
      const domainResponseMock: CreateExportTaskResponse = {
        jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        taskGeometries: [],
        status: TaskStatus.PENDING,
      };

      saveTaskMock.mockResolvedValue({ id: 1 });
      getCustomerTaskByJobIdMock.mockResolvedValue(undefined);
      exportManagerInstanceStub.mockResolvedValue(domainResponseMock);

      const action = async() => taskManager.createTask(request);

      await expect(action()).rejects.toThrow(NotFoundError);
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
      request.domain = Domain.RASTER;

      const createExportTaskResponseSpy = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
      const getEstimationsSpy = jest.spyOn(ExportManagerRaster.prototype, 'getEstimations');
      const response: CreateExportTaskResponse = { taskGeometries: [geo1], jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82c2' };
      const estimationsResponse: GetEstimationsResponse = { estimatedTime: 53230, estimatedFileSize: 52365 };

      saveTaskMock.mockResolvedValue({ id: 1 });
      createExportTaskResponseSpy.mockResolvedValue(response);
      getEstimationsSpy.mockResolvedValue(estimationsResponse);
      getTaskByIdMock.mockResolvedValue(undefined);
      createTaskMock.mockResolvedValue(request);

      const createPromise = taskManager.createTask(request);

      await expect(createPromise).resolves.not.toThrow();
      expect(getEstimationsSpy).toHaveBeenCalledTimes(1);
      expect(createTaskMock).toHaveBeenCalledTimes(1);
      expect(createTaskMock).toHaveBeenCalledWith({
        ...request,
        taskGeometries: response.taskGeometries,
        jobId: response.jobId,
        estimatedSize: estimationsResponse.estimatedFileSize,
        estimatedTime: estimationsResponse.estimatedTime,
      });
    });

    it('resolves and call with the received customer name', async () => {
      const request = mockExportTaskRequest();
      request.domain = Domain.RASTER;

      const createExportTaskResponseSpy = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
      const getEstimationsSpy = jest.spyOn(ExportManagerRaster.prototype, 'getEstimations');
      const response: CreateExportTaskResponse = { taskGeometries: [geo1], jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82c2' };
      const estimationsResponse: GetEstimationsResponse = { estimatedTime: 53230, estimatedFileSize: 52365 };
      const customerName = 'customer_name';

      createExportTaskResponseSpy.mockResolvedValue(response);
      getEstimationsSpy.mockResolvedValue(estimationsResponse);
      getTaskByIdMock.mockResolvedValue(undefined);
      createTaskMock.mockResolvedValue(request);

      const createPromise = taskManager.createTask(request, customerName);

      await expect(createPromise).resolves.not.toThrow();
      expect(getEstimationsSpy).toHaveBeenCalledTimes(1);
      expect(createTaskMock).toHaveBeenCalledTimes(1);
      expect(createTaskMock).toHaveBeenCalledWith({
        ...request,
        customerName: customerName,
      });
    });

    it('resolves and call with the customer name as undefined', async () => {
      const request = mockExportTaskRequest();
      request.domain = Domain.RASTER;

      const createExportTaskResponseSpy = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
      const getEstimationsSpy = jest.spyOn(ExportManagerRaster.prototype, 'getEstimations');
      const response: CreateExportTaskResponse = { taskGeometries: [geo1], jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82c2' };
      const estimationsResponse: GetEstimationsResponse = { estimatedTime: 53230, estimatedFileSize: 52365 };
      const customerName = undefined;

      createExportTaskResponseSpy.mockResolvedValue(response);
      getEstimationsSpy.mockResolvedValue(estimationsResponse);
      getTaskByIdMock.mockResolvedValue(undefined);
      createTaskMock.mockResolvedValue(request);

      const createPromise = taskManager.createTask(request, customerName);

      await expect(createPromise).resolves.not.toThrow();
      expect(getEstimationsSpy).toHaveBeenCalledTimes(1);
      expect(createTaskMock).toHaveBeenCalledTimes(1);
      expect(createTaskMock).toHaveBeenCalledWith({
        ...request,
        customerName: customerName,
      });
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
    it('resolves and returns all task amount by requested limit if its not higher than the max configured limit', async () => {
      const request = mockExportTaskRequest();

      getLatestTasksByLimitMock.mockResolvedValue(request);

      const findPromise = taskManager.getLatestTasksByLimit(10);

      await expect(findPromise).resolves.not.toThrow();
      await expect(findPromise).resolves.toStrictEqual(request);
    });

    it('rejects and throws bad requests error if requested limit is higher than the max configured limit', async () => {
      const request = mockExportTaskRequest();

      getLatestTasksByLimitMock.mockResolvedValue(request);

      const findPromise = taskManager.getLatestTasksByLimit(11);

      await expect(findPromise).rejects.toThrow(BadRequestError);
    });
  });
});
