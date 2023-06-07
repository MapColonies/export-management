import { Logger } from '@map-colonies/js-logger';
import { Artifact, CreateExportTaskRequest, CreateExportTaskResponse, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { ArtifactRasterType, Domain, EPSGDATA } from '@map-colonies/types';
import { ExporterTriggerClient } from '../../clients/exporterTriggerClient';
import { FeatureCollection } from '@turf/turf';
import { BadRequestError } from '@map-colonies/error-types';
import { CreateExportJobResponse, ExportManagerRaster, WebhookParams } from '../../exportManager/exportManagerRaster';
import { Webhook } from '../../exportManager/interfaces';
import { IExportManager } from '../../exportManager/interfaces';
import { ITask, WebhookEvent } from '../interfaces';
import { JobManagerClient } from '../../clients/jobManagerClient';
import { OperationStatus } from '../enums';
import { WebhookClient } from '../../clients/webhookClient';

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
    private readonly webhookClient: WebhookClient,
  ) {}

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<CreateExportJobResponse | WebhookEvent<TaskParameters>> {
    const domain = req.domain;
    const exportManagerInstance = this.getExportManagerInstance(domain);
    const jobCreated = await exportManagerInstance.createExportTask(req);
    return jobCreated;
  }

  public async sendWebhook(params: WebhookParams): Promise<void> {
    const exportJob = await this.jobManagerClient.getJobById(params.jobId);
    const jobParameters = (exportJob as { parameters: Record<string, unknown> }).parameters;
    const task: ITask<TaskParameters> = {
      exportId: (jobParameters as { exportId: number }).exportId, // TBD
      catalogRecordID: params.recordCatalogId,
      domain: Domain.RASTER, // TBD
      ROI: params.roi,
      artifactCRS: EPSGDATA[4326].code, // TBD
      description: params.description,
      keywords: (jobParameters as { keywords: Record<string, unknown> }).keywords,
      status: params.status,
      artifacts: params.artifacts,
      createdAt: (jobParameters as { created: Date }).created, // TODO: handle string date from db to date type
      finishedAt: (jobParameters as { updated: Date }).updated, // TODO: handle string date from db to date type
      expiredAt: params.expirationTime,
    };
    const webhooks = (jobParameters as { webhook: Webhook[] }).webhook;

    const webhookUrls = this.handleWebhookEvents(webhooks, OperationStatus.COMPLETED);
    const webhookEvent: WebhookEvent<TaskParameters> = {
      data: task,
      event: params.status === OperationStatus.COMPLETED ? TaskEvent.TASK_COMPLETED : TaskEvent.TASK_FAILED,
      timestamp: new Date(),
    };
    const webhookPromises: Promise<void>[] = [];

    for (const url of webhookUrls) {
      webhookPromises.push(this.webhookClient.send(url as string, webhookEvent));
    }
    
    const promisesResponse = await Promise.allSettled(webhookPromises);

    promisesResponse.forEach((response, index) => {
      if (response.status === 'rejected') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.logger.error({ reason: response.reason, url: webhookUrls[index], jobId: task.exportId, msg: `Failed to send webhook event` });
      }
    });
  }

  private getExportManagerInstance(domain: Domain): IExportManager {
    let exportManagerInstance: IExportManager;
    const unsupportedDomainMessage = `Unsupported domain requested: "${domain}" - currently only "${Domain.RASTER}" domain is supported`;

    switch (domain) {
      case Domain.RASTER:
        exportManagerInstance = new ExportManagerRaster(this.logger, this.exportManagerRaster, this.jobManagerClient,);
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

  private handleWebhookEvents(webhooks: Webhook[], jobStatus: OperationStatus): (string | undefined)[] {
    let urls: (string | undefined)[] = [];
    if (jobStatus === OperationStatus.COMPLETED) {
      urls = webhooks.map((webhook) => {
        if (webhook.events.includes(TaskEvent.TASK_COMPLETED)) {
          return webhook.url;
        }
      });
    } else if (jobStatus === OperationStatus.FAILED) {
      urls = webhooks.map((webhook) => {
        if (webhook.events === TaskEvent.TASK_FAILED) {
          if (webhook.events.includes(TaskEvent.TASK_FAILED)) {
            return webhook.url;
          }
        }
      });
    }
    return urls;
  }
}
