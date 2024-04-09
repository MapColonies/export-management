import { Logger } from '@map-colonies/js-logger';
import config from 'config';
import { Artifact, CreateExportTaskRequest, IExportManager, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
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

export type TaskResponse = Omit<ITaskEntity, 'jobId' | 'taskGeometries' | 'customerName'>;

@injectable()
export class TasksManager {
  private readonly maxTasksNumber: number;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TASK_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository,
    @inject(ARTIFACT_REPOSITORY_SYMBOL) private readonly artifactRepository: ArtifactRepository
  ) {
    this.maxTasksNumber = config.get<number>('maxTasksNumber');
  }

  public async createTask(req: CreateExportTaskRequest<TaskParameters>, jwtPayloadSub?: string): Promise<TaskResponse> {
    try {
      console.log("Create Task: ", req)
      const domain = req.domain;;
      const exportManagerInstance = this.getExportManagerInstance(domain);

      this.logger.debug({ msg: `create export task request`, req: req });
      this.logger.info({
        msg: `creating export task`,
        catalogRecordID: req.catalogRecordID,
        domain: req.domain,
        webhooks: req.webhooks
      });

      // TODO: Call Domain SDK
      const exportTaskResponse = await exportManagerInstance.createExportTask(req);
      const jobId = exportTaskResponse.jobId;
      this.logger.info({ msg: `received jobId: ${jobId} from domain: ${domain}`, catalogRecordID: req.catalogRecordID, domain: domain });

      // TODO Call Domain SDK to get estimations
      const estimations = await exportManagerInstance.getEstimations(req.catalogRecordID, req.ROI);
      this.logger.debug({
        msg: `received exstimations, estimated file size: ${estimations.estimatedFileSize} estimated time: ${estimations.estimatedTime}`,
      });

      const artifacts = exportTaskResponse.artifacts
      if (exportTaskResponse.artifacts) {
        console.log(exportTaskResponse.artifacts)
      }
      console.log("##REQ", req)
      const task = this.taskRepository.create({
        ...req,
        ...exportTaskResponse,
        ...estimations,
        webhooks: req.webhooks,
        customerName: jwtPayloadSub,
        artifacts: artifacts,
      });
      console.log("TASK",task)

      const res = await this.taskRepository.createTask(task);
      const taskResponse: TaskResponse = res;
      console.log("##",taskResponse)
      return taskResponse;
      // const taskResponse: TaskResponse = {
      //   webhook: res.webhook,
      //   artifactCRS: res.artifactCRS,
      //   catalogRecordID: res.catalogRecordID,
      //   description: res.description,
      //   domain: res.domain,
      //   keywords: res.keywords,
      //   artifacts: artifacts,
      //   id: res.id,
      //   status: res.status,
      //   estimatedSize: estimations.estimatedFileSize,
      //   estimatedTime: estimations.estimatedTime,
      //   errorReason: res.errorReason,
      //   progress: res.progress,
      //   expiredAt: res.expiredAt,
      //   finishedAt: res.finishedAt,
      //   createdAt: res.createdAt,
      //   updatedAt: res.updatedAt,
      // };

      this.logger.debug({ msg: 'successfully created task', res });
      return res;
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
}
