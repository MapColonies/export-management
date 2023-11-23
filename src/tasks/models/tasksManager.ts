import { Logger } from '@map-colonies/js-logger';
import { CreateExportTaskRequest, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { BadRequestError } from '@map-colonies/error-types';
import { ExporterTriggerClient } from '../../clients/exporterTriggerClient';
import { SERVICES } from '../../common/constants';
import { ExportManagerRaster, WebhookParams } from '../../exportManager/exportManagerRaster';
import { Webhook } from '../../exportManager/interfaces';
import { IExportManager } from '../../exportManager/interfaces';
import { ITaskResponse, WebhookEvent } from '../interfaces';
import { JobManagerClient } from '../../clients/jobManager/jobManagerClient';
import { WebhookClient } from '../../clients/webhookClient';
import { ExportJobParameters } from '../../clients/jobManager/interfaces';
import { OperationStatus } from '../../clients/jobManager/enums';
import { convertToUnifiedTaskStatus } from '../../common/utils';

export interface CreateExportTaskExtendedRequest extends CreateExportTaskRequest<TaskParameters> {
  domain: Domain;
  keywords: Record<string, unknown>;
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
    private readonly exportManagerRaster: ExporterTriggerClient,
    private readonly jobManagerClient: JobManagerClient,
    private readonly webhookClient: WebhookClient
  ) {}

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<ITaskResponse<ExportJobParameters>> {
    const domain = req.domain;
    const exportManagerInstance = this.getExportManagerInstance(domain);
    const jobCreated = await exportManagerInstance.createExportTask(req);
    return jobCreated;
  }

  public async getTaskById(id: number): Promise<ITaskResponse<ExportJobParameters>> {
    const domain = Domain.RASTER;
    const exportManagerInstance = this.getExportManagerInstance(domain);
    const task = await exportManagerInstance.getTaskById(id);
    return task;
  }

  public async handleWebhookEvent(params: WebhookParams): Promise<void> {
    const exportJob = await this.jobManagerClient.getJobById(params.jobId);
    const jobParameters = exportJob.parameters;
    const task: ITaskResponse<ExportJobParameters> = {
      id: jobParameters.id,
      catalogRecordID: params.recordCatalogId,
      domain: Domain.RASTER,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ROI: params.roi,
      artifactCRS: EPSGDATA[4326].code,
      description: params.description,
      keywords: jobParameters.keywords,
      status: convertToUnifiedTaskStatus(params.status),
      artifacts: params.artifacts,
      webhook: exportJob.parameters.webhook,
      createdAt: new Date(exportJob.created),
      finishedAt: new Date(exportJob.updated),
      expiredAt: new Date(params.expirationTime),
      errorReason: params.errorReason,
    };
    const webhook = jobParameters.webhook;
    const webhookEvent: WebhookEvent<ExportJobParameters> = {
      data: task,
      event: params.status === OperationStatus.COMPLETED ? TaskEvent.TASK_COMPLETED : TaskEvent.TASK_FAILED,
      timestamp: new Date(),
    };

    const webhookUrls = this.getWebhookUrls(webhook, params.status);
    await this.sendWebhookEvent(webhookUrls, webhookEvent);
  }

  private getExportManagerInstance(domain: Domain): IExportManager {
    let exportManagerInstance: IExportManager;
    const unsupportedDomainMessage = `Unsupported domain requested: "${domain}" - currently only "${Domain.RASTER}" domain is supported`;

    switch (domain) {
      case Domain.RASTER:
        exportManagerInstance = new ExportManagerRaster(this.logger, this.exportManagerRaster, this.jobManagerClient);
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
