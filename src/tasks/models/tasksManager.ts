import { Logger } from '@map-colonies/js-logger';
import { CreateExportTaskRequest, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { ExporterTriggerClient } from '../../clients/exporterTriggerClient';
import { SERVICES } from '../../common/constants';
import { ExportManagerRaster, WebhookParams } from '../../exportManager/exportManagerRaster';
import { Webhook } from '../../exportManager/interfaces';
import { IExportManager } from '../../exportManager/interfaces';
import { ITaskResponse, WebhookEvent } from '../interfaces';
import { ExportJobParameters, JobManagerClient } from '../../clients/jobManagerClient';
import { OperationStatus } from '../enums';
import { WebhookClient } from '../../clients/webhookClient';
import { TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL, TaskRepository } from '../../DAL/repositories/taskRepository';
import { TaskModel } from '../../DAL/models/task';
import { TaskEntity } from '../../DAL/entity/task';

export interface CreateExportTaskExtendedRequest extends CreateExportTaskRequest<TaskParameters> {
  domain: Domain;
  keywords?: Record<string, unknown>;
}

export interface CreatePackageParams {
  dbId: string;
  crs?: string;
  priority?: number;
  roi?: FeatureCollection;
  callbackURLs?: string[];
  description?: string;
}
@injectable()
export class TasksManager {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository,
    private readonly webhookClient: WebhookClient
  ) {}

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<void> {
    const domain = req.domain;
    const exportManagerInstance = this.getExportManagerInstance(domain);
    const jobCreated = await exportManagerInstance.createExportTask(req);
    return jobCreated;
  }

  public async getTaskById(taskId: number): Promise<TaskEntity | undefined> {
    const task = await this.taskRepository.findOneEntity(taskId);
    if (task === undefined){
      throw new NotFoundError(`Task id: ${taskId} not found`);
    }
    return task;
  }

  public async getTasks(limit: number = 10): Promise<TaskEntity[]> {
    const tasks = await this.taskRepository.findEntitiesByLimit(limit);
    return tasks;
  }


  private getExportManagerInstance(domain: Domain): IExportManager {
    let exportManagerInstance: IExportManager;
    const unsupportedDomainMessage = `Unsupported domain requested: "${domain}" - currently only "${Domain.RASTER}" domain is supported`;

    switch (domain) {
      case Domain.RASTER:
        exportManagerInstance = new ExportManagerRaster(this.logger,  this.taskRepository);
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

  // TODO: adapt this Task Events handler function when more events will be supported in future
  private getWebhookUrls(webhooks: Webhook[], jobStatus: OperationStatus): string[] {
    const urls: string[] = [];
    webhooks.forEach((webhook) => {
      if (jobStatus === OperationStatus.COMPLETED) {
        if (webhook.events.includes(TaskEvent.TASK_COMPLETED)) {
          urls.push(webhook.url);
        }
      } else if (webhook.events.includes(TaskEvent.TASK_FAILED)) {
        urls.push(webhook.url);
      }
    });

    return urls;
  }

  private async sendWebhookEvent(webhookUrls: string[], webhookEvent: WebhookEvent<ExportJobParameters>): Promise<void> {
    if (webhookUrls.length > 0) {
      const webhookPromises: Promise<void>[] = [];
      for (const url of webhookUrls) {
        webhookPromises.push(this.webhookClient.send(url, webhookEvent));
      }

      const promisesResponse = await Promise.allSettled(webhookPromises);
      promisesResponse.forEach((response, index) => {
        if (response.status === 'rejected') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          this.logger.error({ reason: response.reason, url: webhookUrls[index], id: webhookEvent.data.id, msg: `Failed to send webhook event` });
        }
      });
    } else {
      this.logger.info({ msg: `No urls are requested for the specific task event: "${webhookEvent.event}` });
    }
  }
}
