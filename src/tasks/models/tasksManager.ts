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
import { FindOneEntityParams, TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL, TaskRepository } from '../../DAL/repositories/taskRepository';
import { TaskEntity } from '../../DAL/entity/task';

@injectable()
export class TasksManager {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository
  ) {}

  public async createExportTask(req: CreateExportTaskRequest<TaskParameters>): Promise<TaskEntity> {
    try {
      this.logger.info({ msg: `Creating export task`, req: req });

      const domain = req.domain;
      const exportManagerInstance = this.getExportManagerInstance(domain);
      // TODO: Call Domain SDK
      const exportTaskResponse = await exportManagerInstance.createExportTask(req);
      const jobId = exportTaskResponse.jobId;
      const entity = await this.findOneEntity({ jobId });
      // return the entity if its already exists
      if (entity) {
        this.logger.debug(entity, `Found an entity with the same job ib: ${jobId}`)
        return entity;
      }
      // TODO Call Domain SDK to get estimations
      const exstimations = await exportManagerInstance.getEstimations();
      // TODO: Get customer name
      const customerName = 'Cutomer_Name';

      let newEntity = new TaskEntity();
      Object.assign(newEntity, req, {
        taskGeometries: exportTaskResponse.geometries,
        jobId: exportTaskResponse.jobId,
        customerName,
        estimatedDataSize: exstimations.estimatedFileSize,
        estimatedTime: exstimations.estimatedTime,
      });

      const res = await this.taskRepository.createEntity(newEntity);
      return res;
    } catch (error) {
      const errMessage = `Failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async findOneEntity(param: FindOneEntityParams): Promise<TaskEntity | undefined> {
    try {
      this.logger.info({ msg: `Getting task by id`, param });

      const task = await this.taskRepository.findOneEntity(param);
      console.log(task);
      return task;
    } catch (error) {
      const errMessage = `Failed to get task id ${param}: ${(error as Error).message}`;
      this.logger.error({ err: error, taskId: param, msg: errMessage });
      throw error;
    }
  }

  public async getLatestTasksByLimit(limit = 10): Promise<TaskEntity[]> {
    try {
      this.logger.info({ msg: `Getting task by limit ${limit}`, limit });

      return await this.taskRepository.getLatestEntitiesByLimit(limit);
    } catch (error) {
      const errMessage = `Failed to get tasks by limit: ${(error as Error).message}`;
      this.logger.error({ err: error, limit: limit, msg: errMessage });
      throw error;
    }
  }

  private getExportManagerInstance(domain: Domain): IExportManager {
    let exportManagerInstance: IExportManager;
    const unsupportedDomainErrorMsg = `Unsupported domain requested: "${domain}" - currently only "${Domain.RASTER}" domain is supported`;
    try {
      this.logger.debug({ msg: `Getting export manager instance by domain: ${domain}`, domain });

      switch (domain) {
        case Domain.RASTER:
          exportManagerInstance = new ExportManagerRaster(this.logger);
          break;
        case Domain.DEM:
          throw new BadRequestError(unsupportedDomainErrorMsg);
        case Domain._3D:
          throw new BadRequestError(unsupportedDomainErrorMsg);
        default:
          throw new BadRequestError(unsupportedDomainErrorMsg);
      }
      return exportManagerInstance;
    } catch (error) {
      const errMessage = `Failed to get export manager instance by domain, ${(error as Error).message}`;
      this.logger.error({ err: error, domain: domain, msg: errMessage });
      throw error;
    }
  }
}
