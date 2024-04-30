import jsLogger from '@map-colonies/js-logger';
import { Domain } from '@map-colonies/types';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { CreateExportTaskResponse, GetEstimationsResponse } from '@map-colonies/export-interfaces';
import { mockExportTaskRequest } from '../helpers/helpers';
import { geo1 } from '../../../src/exportManager/geoMocks';
import { ExportManagerRaster } from '../../../src/exportManager/exportManagerRaster';
import { TasksManager } from '../../../src/task/models/tasksManager';
import { createTaskMock, getLatestTasksByLimitMock, getTaskByIdMock, taskRepositoryMock } from '../../mocks/repositories/taskRepository.spec';
import { webhooksRepositoryMock } from '../../mocks/repositories/webhooksRepository.spec';

let taskManager: TasksManager;
describe('taskManager', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    taskManager = new TasksManager(jsLogger({ enabled: false }), taskRepositoryMock, webhooksRepositoryMock);
  });

  describe('#createTask', () => {
    it('resolves without errors', async () => {
      const request = mockExportTaskRequest();

      createTaskMock.mockResolvedValue(request);

      const createPromise = taskManager.createTask(request);

      await expect(createPromise).resolves.not.toThrow();
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
