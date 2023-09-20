import { Logger } from '@map-colonies/js-logger';
import { CreateExportTaskRequest, IExportManager, TaskParameters } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { Domain } from '@map-colonies/types';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { SERVICES } from '../../common/constants';
import { ExportManagerRaster } from '../../exportManager/exportManagerRaster';
import { TASK_REPOSITORY_SYMBOL, TaskRepository } from '../../DAL/repositories/taskRepository';
import { TaskEntity } from '../../DAL/entity/task';
import { ITaskEntity } from '../../DAL/models/task';

@injectable()
export class TasksManager {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TASK_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository
  ) { }

  public async createTask(req: CreateExportTaskRequest<TaskParameters>): Promise<ITaskEntity> {
    try {
      this.logger.debug({ msg: `create export task request`, req: req });
      this.logger.info({ msg: `creating export task`, catalogRecordID: req.catalogRecordID, domain: req.domain, webhook: req.webhook, artifactCRS: req.artifactCRS });

      const domain = req.domain;
      const exportManagerInstance = this.getExportManagerInstance(domain);
      // TODO: Call Domain SDK
      const exportTaskResponse = await exportManagerInstance.createExportTask(req);
      const jobId = exportTaskResponse.jobId;
      this.logger.info({ msg: `received jobId: ${jobId} from domain: ${domain}` })
      // TODO Call Domain SDK to get estimations
      const exstimations = await exportManagerInstance.getEstimations(req.catalogRecordID, req.ROI);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.logger.debug({ msg: `received exstimations, estimated file size: ${exstimations.estimatedFileSize} estimated time: ${exstimations.estimatedTime}` })
      // TODO: Get customer name
      const customerName = 'cutomer_name';
      const task = new TaskEntity();
      Object.assign(task, req, {
        taskGeometries: exportTaskResponse.geometries,
        jobId: exportTaskResponse.jobId,
        customerName,
        estimatedDataSize: exstimations.estimatedFileSize,
        estimatedTime: exstimations.estimatedTime,
      });

      const res = await this.taskRepository.createTask(task);
      this.logger.debug({ msg: `successfully created task`, res })
      return res;
    } catch (error) {
      const errMessage = `failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async getTaskById(id: number): Promise<ITaskEntity | undefined> {
    try {
      this.logger.info({ msg: `getting task by id: ${id}`, id });

      const task = await this.taskRepository.getTaskById({ id });
      if (!task) {
        throw new NotFoundError(`task id: ${id} is not found`);
      }
      return task;
    } catch (error) {
      const errMessage = `failed to get task id ${id}: ${(error as Error).message}`;
      this.logger.error({ err: error, id, msg: errMessage });
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  public async getLatestTasksByLimit(limit = 10): Promise<ITaskEntity[]> {
    try {
      this.logger.info({ msg: `getting task by limit ${limit}`, limit });
      const res = await this.taskRepository.getLatestTasksByLimit(limit);
      return res;
    } catch (error) {
      const errMessage = `failed to get tasks by limit: ${(error as Error).message}`;
      this.logger.error({ err: error, limit: limit, msg: errMessage });
      throw error;
    }
  }

  private getExportManagerInstance(domain: Domain): IExportManager {
    let exportManagerInstance: IExportManager;
    const unsupportedDomainErrorMsg = `unsupported domain requested: "${domain}" - currently only "${Domain.RASTER}" domain is supported`;
    try {
      this.logger.debug({ msg: `getting export manager instance by domain: ${domain}`, domain });

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
      const errMessage = `failed to get export manager instance by domain, ${(error as Error).message}`;
      this.logger.error({ err: error, domain: domain, msg: errMessage });
      throw error;
    }
  }
}
