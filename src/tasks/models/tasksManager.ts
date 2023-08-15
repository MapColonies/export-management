import { Logger } from '@map-colonies/js-logger';
import { CreateExportTaskRequest, CreateExportTaskResponse, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { Domain } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { SERVICES } from '../../common/constants';
import { ExportManagerRaster } from '../../exportManager/exportManagerRaster';
import { Webhook } from '../../exportManager/interfaces';
import { IExportManager } from '../../exportManager/interfaces';
import { TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL, TaskRepository } from '../../DAL/repositories/taskRepository';
import { TaskEntity } from '../../DAL/entity/task';

@injectable()
export class TasksManager {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository,
  ) {}

  public async createExportTask(req: CreateExportTaskRequest<TaskParameters>): Promise<TaskEntity> {
    const domain = req.domain;
    const exportManagerInstance = this.getExportManagerInstance(domain);
    // TODO: Call Domain SDK
    const exportTaskResponse = await exportManagerInstance.createExportTask(req);
    // TODO Call Domain SDK to get estimations
    const exstimations = await exportManagerInstance.getEstimations();
    // TODO: Get customer name
    const customerName = 'Cutomer_Name';
    let entity = new TaskEntity();

    Object.assign(entity, req, {
      taskGeometries: exportTaskResponse.geometries,
      jobId: exportTaskResponse.jobId,
      customerName,
      estimatedDataSize: exstimations.estimatedFileSize,
      estimatedTime: exstimations.estimatedTime,
    });

    const res = await this.taskRepository.createEntity(entity);
    return res;
  }

  public async getTaskById(taskId: number): Promise<TaskEntity | undefined> {
    const task = await this.taskRepository.findOneEntity(taskId);
    if (task === undefined) {
      throw new NotFoundError(`Task id: ${taskId} is not found`);
    }
    return task;
  }

  public async getLatestTasksByLimit(limit = 10): Promise<TaskEntity[]> {
    const tasks = await this.taskRepository.getLatestEntitiesByLimit(limit);
    return tasks;
  }

  private getExportManagerInstance(domain: Domain): IExportManager {
    let exportManagerInstance: IExportManager;
    const unsupportedDomainMessage = `Unsupported domain requested: "${domain}" - currently only "${Domain.RASTER}" domain is supported`;

    switch (domain) {
      case Domain.RASTER:
        exportManagerInstance = new ExportManagerRaster(this.logger);
        break;
      case Domain.DEM:
        throw new BadRequestError(unsupportedDomainMessage);
      case Domain._3D:
        throw new BadRequestError(unsupportedDomainMessage);
      default:
        throw new BadRequestError(unsupportedDomainMessage);
    }

    return exportManagerInstance;
  }
}
