import jsLogger from '@map-colonies/js-logger';
import { Domain } from '@map-colonies/types';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { GetEstimationsResponse } from '@map-colonies/export-interfaces';
import { TaskRepository } from '../../../src/DAL/repositories/taskRepository';
import { createFakeEntity } from '../helpers/helpers';
import { geo1 } from '../../../src/exportManager/geoMocks';
import { ExportManagerRaster } from '../../../src/exportManager/exportManagerRaster';
import { TasksManager } from '../../../src/task/models/tasksManager';

let taskManager: TasksManager;
let taskRepository: TaskRepository;

describe('taskManager', () => {
  const createTask = jest.fn();
  const getTaskById = jest.fn();
  const getLatestTasksByLimit = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    taskRepository = {
      createTask,
      getTaskById,
      getLatestTasksByLimit,
    } as unknown as TaskRepository;

    taskManager = new TasksManager(jsLogger({ enabled: false }), taskRepository);
  });

  describe('#createTask', () => {
    it('resolves without errors', async () => {
      const entity = createFakeEntity();

      createTask.mockResolvedValue(entity);

      const createPromise = taskManager.createTask(entity);

      await expect(createPromise).resolves.not.toThrow();
    });

    it('rejects with bad request error due to unsupported domain "DEM"', async () => {
      const entity = createFakeEntity();
      entity.domain = Domain.DEM;

      createTask.mockResolvedValue(undefined);

      const createPromise = taskManager.createTask(entity);

      await expect(createPromise).rejects.toThrow(BadRequestError);
      expect(createTask).not.toHaveBeenCalled();
    });

    it('rejects with bad request error due to unsupported domain "3D"', async () => {
      const entity = createFakeEntity();
      entity.domain = Domain._3D;

      createTask.mockResolvedValue(undefined);

      const createPromise = taskManager.createTask(entity);

      await expect(createPromise).rejects.toThrow(BadRequestError);
      expect(createTask).not.toHaveBeenCalled();
    });

    it('rejects with bad request error due to any other unsupported domain value', async () => {
      const entity = createFakeEntity();
      entity.domain = 'test_domain' as unknown as Domain;

      createTask.mockResolvedValue(undefined);

      const createPromise = taskManager.createTask(entity);

      await expect(createPromise).rejects.toThrow(BadRequestError);
      expect(createTask).not.toHaveBeenCalled();
    });

    it('resolves and call with the received task geometries and estimations', async () => {
      const entity = createFakeEntity();
      entity.domain = Domain.RASTER;

      const createExportTaskResponseSpy = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
      const getEstimationsSpy = jest.spyOn(ExportManagerRaster.prototype, 'getEstimations');
      const response = { geometries: [geo1], jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82c2' };
      const estimationsResponse: GetEstimationsResponse = { estimatedTime: 53230, estimatedFileSize: 52365 };

      createExportTaskResponseSpy.mockResolvedValue(response);
      getEstimationsSpy.mockResolvedValue(estimationsResponse);
      getTaskById.mockResolvedValue(undefined);
      createTask.mockResolvedValue(entity);

      const createPromise = taskManager.createTask(entity);

      await expect(createPromise).resolves.not.toThrow();
      expect(getEstimationsSpy).toHaveBeenCalledTimes(1);
      expect(createTask).toHaveBeenCalledTimes(1);
      expect(createTask).toHaveBeenCalledWith({
        ...entity,
        taskGeometries: response.geometries,
        jobId: response.jobId,
        estimatedDataSize: estimationsResponse.estimatedFileSize,
        estimatedTime: estimationsResponse.estimatedTime,
        // TODO: handle customer name once implemented
        customerName: 'cutomer_name',
      });
    });
  });

  describe('#getTaskById', () => {
    it('resolves and find exists entity', async () => {
      const entity = createFakeEntity();

      getTaskById.mockResolvedValue(entity);

      const findPromise = taskManager.getTaskById(1);

      await expect(findPromise).resolves.not.toThrow();
      await expect(findPromise).resolves.toStrictEqual(entity);
    });

    it('resolves with not found error if task id is not exists', async () => {
      getTaskById.mockResolvedValue(undefined);

      const findPromise = taskManager.getTaskById(1);

      await expect(findPromise).rejects.toThrow(NotFoundError);
    });
  });


  describe('#getLatestTasksByLimit', () => {
    it('resolves and returns all task amount by requested limit if its not higher than the max configured limit', async () => {
      const entity = createFakeEntity();

      getLatestTasksByLimit.mockResolvedValue(entity);

      const findPromise = taskManager.getLatestTasksByLimit(10);

      await expect(findPromise).resolves.not.toThrow();
      await expect(findPromise).resolves.toStrictEqual(entity);
    });

    it('rejects and throws bad requests error if requested limit is higher than the max configured limit', async () => {
      const entity = createFakeEntity();

      getLatestTasksByLimit.mockResolvedValue(entity);

      const findPromise = taskManager.getLatestTasksByLimit(11);

      await expect(findPromise).rejects.toThrow(BadRequestError);
    });
  });
});
