import { Logger } from '@map-colonies/js-logger';
import config from 'config';
import { Artifact, CreateExportTaskRequest, GetEstimationsResponse, IExportManager, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { ArtifactRasterType, Domain } from '@map-colonies/types';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { SERVICES } from '../../common/constants';
import { ExportManagerRaster } from '../../exportManager/exportManagerRaster';
import { TASK_REPOSITORY_SYMBOL, TaskRepository } from '../../DAL/repositories/taskRepository';
import { TaskEntity } from '../../DAL/entity/tasks';
import { ITaskEntity } from '../../DAL/models/tasks';
import { ARTIFACT_REPOSITORY_SYMBOL, ArtifactRepository } from '../../DAL/repositories/artifactRepository';
import { ArtifactEntity } from '../../DAL/entity';
import { FeatureCollection } from '@turf/turf';
import { WEBHOOKS_REPOSITORY_SYMBOL, WebhooksRepository } from '../../DAL/repositories/webhooksRepository';

export type TaskResponse = Omit<ITaskEntity, 'jobId' | 'taskGeometries' | 'customerName'>;

@injectable()
export class TasksManager {
  private readonly maxTasksNumber: number;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TASK_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository,
    @inject(WEBHOOKS_REPOSITORY_SYMBOL) private readonly webhooksRepository: WebhooksRepository
  ) {
    this.maxTasksNumber = config.get<number>('maxTasksNumber');
  }

  public async createTask(req: CreateExportTaskRequest<TaskParameters>, jwtPayloadSub?: string): Promise<TaskResponse> {
    try {
      const domain = req.domain;;
      // const customerName = jwtPayloadSub;
      const customerName = 'Maof';
      const exportManagerInstance = this.getExportManagerInstance(domain);

      // TODO: Call Domain SDK
      this.logger.info({ msg: `create export task request for ${domain} domain`, catalogRecordID: req.catalogRecordID, domain: domain });
      const exportTaskResponse = await exportManagerInstance.createExportTask(req);

      // TODO Call Domain SDK to get estimations
      this.logger.info({msg: 'get estimation request', domain});
      const estimations = await this.getEstimations(exportManagerInstance, req.catalogRecordID, req.ROI);
      
      const isCustomerTaskExists = await this.taskRepository.isCustomerTaskExists(exportTaskResponse.jobId, customerName);
      // Think what to do when customer and jobId is the same with task on progress / pending;
      if (isCustomerTaskExists){
        const task = await this.taskRepository.getExistsCustomerTask(exportTaskResponse.jobId, customerName);
        taskResponse = task? await this.webhooksRepository.addWebhooks(req.webhooks, task) : undefined;
      } else {

        console.log("isTaskExists", isCustomerTaskExists)
        this.logger.info({ msg: 'create and save task to database', req });
        const taskResponse = await this.taskRepository.createAndSaveTask(req, exportTaskResponse, estimations, customerName);
      }

      return taskResponse;
    } catch (error) {
      const errMessage = `failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async getTaskById(id: number): Promise<ITaskEntity | undefined> {
    try {
      this.logger.info({ msg: `get task by id: ${id}`, id });

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

  public async getLatestTasksByLimit(limit: number): Promise<ITaskEntity[]> {
    try {
      this.logger.info({ msg: `getting task by limit ${limit}`, limit });
      if (limit > this.maxTasksNumber) {
        throw new BadRequestError(`requested limit ${limit} is higher than the maximum possible limit tasks number ${this.maxTasksNumber}`);
      }
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

  private async getEstimations(exportManagerInstance: IExportManager, recordCatalogId: string , ROI: FeatureCollection): Promise<GetEstimationsResponse> {
    const estimations = await exportManagerInstance.getEstimations(recordCatalogId, ROI);
    this.logger.debug({
      msg: `received exstimations, estimated file size: ${estimations.estimatedFileSize} estimated time: ${estimations.estimatedTime}`,
    });

    return estimations;
  }
}
