import { Logger } from '@map-colonies/js-logger';
import config from 'config';
import { Artifact, CreateExportTaskRequest, CreateExportTaskResponse, GetEstimationsResponse, IExportManager, TaskParameters, TaskStatus, Webhook } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { ArtifactRasterType, Domain } from '@map-colonies/types';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { SERVICES } from '../../common/constants';
import { ExportManagerRaster } from '../../exportManager/exportManagerRaster';
import { TASK_REPOSITORY_SYMBOL, TaskRepository } from '../../DAL/repositories/taskRepository';
import { TaskEntity } from '../../DAL/entity/tasks';
import { ITaskEntity } from '../../DAL/models/tasks';
import { ARTIFACT_REPOSITORY_SYMBOL, ArtifactRepository } from '../../DAL/repositories/artifactRepository';
import { ArtifactEntity, WebhookEntity } from '../../DAL/entity';
import { FeatureCollection } from '@turf/turf';
import { WEBHOOKS_REPOSITORY_SYMBOL, WebhooksRepository } from '../../DAL/repositories/webhooksRepository';
import { omit } from '../../common/utils';
import { IWebhookEntity } from '../../DAL/models/webhooks';

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
      const customerName = 'ronen'
      const catalogRecordID = req.catalogRecordID;
      const exportManagerInstance = this.getExportManagerInstance(domain);

      // TODO: Call Domain SDK
      this.logger.info({ msg: `create export task request for ${domain} domain`, catalogRecordID, domain });
      const domainResponse = await exportManagerInstance.createExportTask(req);

      const task = await this.upsertTask(exportManagerInstance, req, domainResponse, customerName);
      const taskResponse: TaskResponse = omit(task, ['jobId', 'taskGeometries', 'customerName']);

      return taskResponse;
    } catch (error) {
      const errMessage = `failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async getTaskById(id: number): Promise<TaskResponse> {
    try {
      this.logger.info({ msg: `get task by id: ${id}`, id });

      const task = await this.taskRepository.getTaskById({ id });
      if (!task) {
        throw new NotFoundError(`task id: ${id} is not found`);
      }

      const taskResponse: TaskResponse = omit(task, ['jobId', 'taskGeometries', 'customerName']);
      return taskResponse;
    } catch (error) {
      const errMessage = `failed to get task id ${id}: ${(error as Error).message}`;
      this.logger.error({ err: error, id, msg: errMessage });
      throw error;
    }
  }

  public async getLatestTasksByLimit(limit: number): Promise<TaskResponse[]> {
    try {
      this.logger.info({ msg: `get task by limit ${limit}`, limit });
      if (limit > this.maxTasksNumber) {
        throw new BadRequestError(`requested limit ${limit} is higher than the maximum possible limit tasks number ${this.maxTasksNumber}`);
      }
      let tasksResponse: TaskResponse[] = [];
      const tasks = await this.taskRepository.getLatestTasksByLimit(limit);
      tasks.forEach(task => {
        const taskResponse: TaskResponse = omit(task, ['jobId', 'taskGeometries', 'customerName']);
        tasksResponse.push(taskResponse);
      });
      return tasksResponse;
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
      this.logger.debug({ msg: `get export manager instance by domain: ${domain}`, domain });

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

  private async upsertTask(exportManagerInstance: IExportManager, req: CreateExportTaskRequest<TaskParameters>, domainResponse: CreateExportTaskResponse, customerName?: string): Promise<ITaskEntity> {
    const jobId = domainResponse.jobId;
    this.logger.info({ msg: `querying for similar task by job id ${jobId} and customer name: ${customerName}`, jobId: domainResponse.jobId, customerName });
    const task = await this.taskRepository.getCustomerTaskByJobId(jobId, customerName);

    if (task && (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS)) {
      this.logger.info({ msg: `found similar task id ${task.id} with job id ${jobId} and customer name: ${customerName}, updating task webhooks request`, jobId, customerName, webhooks: req.webhooks });
      await this.webhooksRepository.upsertWebhooks(req.webhooks, task.id);
      return task;
    }

    this.logger.info({ msg: `was not found similar task with job id: ${jobId} and customer name: ${customerName}, creating new task` });
    const res = await this.createNewTask(exportManagerInstance, req, domainResponse, customerName);
    return res;
  }

  private async getEstimations(exportManagerInstance: IExportManager, recordCatalogId: string, ROI: FeatureCollection): Promise<GetEstimationsResponse> {
    const estimations = await exportManagerInstance.getEstimations(recordCatalogId, ROI);
    this.logger.debug({
      msg: `received estimations, estimated file size: ${estimations.estimatedFileSize} estimated time: ${estimations.estimatedTime}`,
    });

    return estimations;
  }

  private async createNewTask(exportManagerInstance: IExportManager, req: CreateExportTaskRequest<TaskParameters>, exportTaskResponse: CreateExportTaskResponse, customerName?: string): Promise<ITaskEntity> {
    const estimations = await this.getEstimations(exportManagerInstance, req.catalogRecordID, req.ROI);
    const task = this.taskRepository.create({
      ...req,
      ...exportTaskResponse,
      ...estimations,
      customerName,
    });

    const res = await this.taskRepository.saveTask(task);
    return res;
  }

}
