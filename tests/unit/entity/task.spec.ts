import jsLogger from '@map-colonies/js-logger';
import { faker } from '@faker-js/faker';
import { TasksManager } from '../../../src/tasks/models/tasksManager';
import { TaskRepository } from '../../../src/DAL/repositories/taskRepository';
import { createFakeEntity } from '../helpers/helpers';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { geo1 } from '../../../src/exportManager/geoMocks';
import { CreateExportTaskResponse, GetEstimationsResponse, TaskEvent } from '@map-colonies/export-interfaces';
import { ExportManagerRaster } from '../../../src/exportManager/exportManagerRaster';
import { NotFound } from 'express-openapi-validator/dist/openapi.validator';
import { NotFoundError } from '@map-colonies/error-types';

let taskManager: TasksManager;
let taskRepository: TaskRepository;

describe('taskManager', () => {
  const createEntity = jest.fn();
  const findOneEntity = jest.fn();
  const getLatestEntitiesByLimit = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    taskRepository = {
      createEntity,
      findOneEntity,
      getLatestEntitiesByLimit,
    } as unknown as TaskRepository;

    taskManager = new TasksManager(jsLogger({ enabled: false }), taskRepository);
  });

  describe('#createEntity', () => {
    it('resolves without errors', async () => {
      const entity = createFakeEntity();

      findOneEntity.mockResolvedValue(undefined);
      createEntity.mockResolvedValue(undefined);

      const createPromise = taskManager.createExportTask(entity);

      await expect(createPromise).resolves.not.toThrow();
    });

    it('rejects if domain is not supported', async () => {
      const entity = createFakeEntity();
      entity.domain = Domain.DEM;

      createEntity.mockResolvedValue(undefined);

      const createPromise = taskManager.createExportTask(entity);

      await expect(createPromise).rejects.toThrow();
      expect(findOneEntity).not.toBeCalled();
      expect(createEntity).not.toBeCalled();
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
      findOneEntity.mockResolvedValue(undefined);
      createEntity.mockResolvedValue(entity);

      const createPromise = taskManager.createExportTask(entity);

      await expect(createPromise).resolves.not.toThrow();
      expect(getEstimationsSpy).toBeCalledTimes(1);
      expect(createEntity).toBeCalledTimes(1);
      expect(createEntity).toBeCalledWith({
        ...entity,
        taskGeometries: response.geometries,
        jobId: response.jobId,
        estimatedDataSize: estimationsResponse.estimatedFileSize,
        estimatedTime: estimationsResponse.estimatedTime,
        // TODO: handle customer name once implemented
        customerName: 'Cutomer_Name',
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
      findOneEntity.mockResolvedValue(entity);

      const createPromise = taskManager.createExportTask(entity);

      await expect(createPromise).resolves.not.toThrow();
      expect(getEstimationsSpy).not.toBeCalled();
      expect(createEntity).not.toBeCalled();
    });
  });

  describe('#findOneEntity', () => {
    it('resolves and find exists entity', async () => {
      const entity = createFakeEntity();

      findOneEntity.mockResolvedValue(entity);

      const findPromise = taskManager.findOneEntity({ id: 1 });

      await expect(findPromise).resolves.not.toThrow();
      await expect(findPromise).resolves.toStrictEqual({
        artifactCRS: EPSGDATA[4326].code,
        catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
        domain: Domain.RASTER,
        webhook: [{ events: [TaskEvent.TASK_COMPLETED], url: 'http://localhost:8080/' }],
      });
    });

    it('resolves with not found error if task id is not exists', async () => {
      const entity = createFakeEntity();

      findOneEntity.mockResolvedValue(undefined);

      const findPromise = taskManager.findOneEntity({ id: 1 });

      await expect(findPromise).resolves.toBeUndefined();
    });
  });
});
