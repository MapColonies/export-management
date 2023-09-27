import jsLogger from '@map-colonies/js-logger';
import { Domain } from '@map-colonies/types';
import { NotFoundError } from '@map-colonies/error-types';
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

      getTaskById.mockResolvedValue(undefined);
      createTask.mockResolvedValue(undefined);

      const createPromise = taskManager.createTask(entity);

      await expect(createPromise).resolves.not.toThrow();
    });

    it('rejects if domain is not supported', async () => {
      const entity = createFakeEntity();
      entity.domain = Domain.DEM;

      createTask.mockResolvedValue(undefined);

      const createPromise = taskManager.createTask(entity);

      await expect(createPromise).rejects.toThrow();
      expect(getTaskById).not.toHaveBeenCalled();
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

    it('resolves and return the entity if job id is exists', async () => {
      const entity = createFakeEntity();
      entity.domain = Domain.RASTER;

      const createExportTaskResponseSpy = jest.spyOn(ExportManagerRaster.prototype, 'createExportTask');
      const getEstimationsSpy = jest.spyOn(ExportManagerRaster.prototype, 'getEstimations');
      const response = { geometries: [geo1], jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82c2' };

      createExportTaskResponseSpy.mockResolvedValue(response);
      getEstimationsSpy.mockResolvedValue({ estimatedTime: undefined, estimatedFileSize: undefined });

      const createPromise = taskManager.createTask(entity);

      await expect(createPromise).resolves.not.toThrow();
      expect(getEstimationsSpy).toHaveBeenCalledTimes(1);
      expect(createTask).toHaveBeenCalledTimes(1);
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
});
