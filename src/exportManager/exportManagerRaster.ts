import { Logger } from '@map-colonies/js-logger';
import { Artifact, TaskStatus, Webhook } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import config from 'config';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { convertToUnifiedTaskStatus, generateUniqueId } from '../common/utils';
import { SERVICES } from '../common/constants';
import { CreateExportJobTriggerResponse, ExporterTriggerClient } from '../clients/exporterTriggerClient';
import { CreateExportTaskExtendedRequest, CreatePackageParams } from '../tasks/models/tasksManager';
import { JobManagerClient } from '../clients/jobManager/jobManagerClient';
import { ExportJobParameters } from '../clients/jobManager/interfaces';
import { ITaskResponse } from '../tasks/interfaces';
import { ICallbackExportData, IExportManager } from '../exportManager/interfaces';
import { OperationStatus } from '../clients/jobManager/enums';

export interface WebhookParams {
  expirationTime: string;
  recordCatalogId: string;
  jobId: string;
  description?: string;
  artifacts: Artifact[];
  roi: FeatureCollection;
  status: OperationStatus;
  errorReason?: string;
}

@injectable()
export class ExportManagerRaster implements IExportManager {
  private readonly serviceWebhookEndpoint: string;
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    private readonly exporterTriggerClient: ExporterTriggerClient,
    private readonly jobManagerClient: JobManagerClient
  ) {
    this.serviceWebhookEndpoint = config.get<string>('serviceWebhookEndpoint');
  }

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<ITaskResponse<ExportJobParameters>> {
    try {
      this.logger.info({ msg: `Create export task request`, req: req });
      const requestedEPSG = `EPSG:${req.artifactCRS}`;
      const createPackageParams: CreatePackageParams = {
        roi: req.ROI,
        dbId: req.catalogRecordID,
        crs: requestedEPSG,
        description: req.description,
        callbackURLs: [this.serviceWebhookEndpoint],
      };
      const res = await this.exporterTriggerClient.createExportTask(createPackageParams);
      const exportJob = await this.jobManagerClient.getJobById(res.jobId);

      if ((res as WebhookParams).status === OperationStatus.COMPLETED) {
        const task: ITaskResponse<ExportJobParameters> = {
          id: exportJob.parameters.id,
          catalogRecordID: (res as WebhookParams).recordCatalogId,
          domain: Domain.RASTER,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ROI: (res as WebhookParams).roi,
          artifactCRS: EPSGDATA[4326].code,
          description: req.description,
          keywords: req.keywords,
          status: convertToUnifiedTaskStatus((res as WebhookParams).status),
          artifacts: (res as WebhookParams).artifacts,
          createdAt: new Date(exportJob.created),
          finishedAt: new Date(exportJob.updated),
          expiredAt: new Date((res as WebhookParams).expirationTime),
          webhook: req.webhook,
        };

        return task;
      } else {
        let createExportJobResponse: ITaskResponse<ExportJobParameters>;
        if ((res as CreateExportJobTriggerResponse).isDuplicated) {
          createExportJobResponse = {
            id: exportJob.parameters.id,
            catalogRecordID: req.catalogRecordID,
            artifactCRS: EPSGDATA[4326].code,
            createdAt: new Date(exportJob.created),
            status: TaskStatus.PENDING,
            domain: Domain.RASTER,
            webhook: req.webhook,
          };
          return createExportJobResponse;
        }

        const exportId = generateUniqueId();
        const updatedParams = { ...exportJob.parameters, id: exportId, keywords: req.keywords, webhook: req.webhook };

        await this.jobManagerClient.updateJobParameters((res as { jobId: string }).jobId, updatedParams);
        createExportJobResponse = {
          id: exportId,
          catalogRecordID: req.catalogRecordID,
          artifactCRS: EPSGDATA[4326].code,
          createdAt: new Date(exportJob.created),
          status: convertToUnifiedTaskStatus((res as WebhookParams).status),
          domain: Domain.RASTER,
          webhook: req.webhook,
        };
        return createExportJobResponse;
      }
    } catch (error) {
      const errMessage = `Failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async getTaskById(id: number): Promise<ITaskResponse<ExportJobParameters>> {
    this.logger.info({ msg: `get export task by id`, id });
    const job = await this.jobManagerClient.getJobByExportId(id);
    const taskStatus = await this.exporterTriggerClient.getTaskStatusByJobId(job.id);
    const callbackParams = job.parameters.callbackParams as ICallbackExportData;
    const webhook = job.parameters.webhook as Webhook[];
    const task: ITaskResponse<ExportJobParameters> = {
      id: id,
      catalogRecordID: job.internalId,
      domain: Domain.RASTER,
      artifactCRS: EPSGDATA[4326].code,
      description: job.description,
      status: job.isCleaned ? TaskStatus.EXPIRED : convertToUnifiedTaskStatus(taskStatus.status),
      progress: taskStatus.percentage,
      errorReason: job.reason,
      estimatedSize: job.parameters.gpkgEstimatedSize as number,
      artifacts: job.status === OperationStatus.COMPLETED && !job.isCleaned ? callbackParams.artifacts : undefined,
      createdAt: job.created,
      finishedAt: job.updated,
      expiredAt: job.status === OperationStatus.COMPLETED ? callbackParams.expirationTime : undefined,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ROI: job.parameters.roi as FeatureCollection,
      webhook: webhook,
    };

    return task;
  }
}
