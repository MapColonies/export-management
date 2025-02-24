import { Logger } from '@map-colonies/js-logger';
import { Artifact, TaskStatus, Webhook } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import config from 'config';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { ExportJobParameters as RasterExportJobParams, roiFeatureCollectionSchema } from '@map-colonies/raster-shared';
import { CallbackExportResponse } from '@map-colonies/raster-shared';
import { IJobResponse } from '@map-colonies/mc-priority-queue';
import { z } from 'zod';
import { convertToUnifiedTaskStatus, generateUniqueId } from '../common/utils';
import { SERVICES } from '../common/constants';
import { CreateExportJobTriggerResponse, ExporterTriggerClient } from '../clients/exporterTriggerClient';
import { CreateExportTaskExtendedRequest, CreatePackageParams } from '../tasks/models/tasksManager';
import { JobManagerClient } from '../clients/jobManager/jobManagerClient';
import { ExportJobParameters, ExportJobResponse } from '../clients/jobManager/interfaces';
import { IExportTaskResponse } from '../tasks/interfaces';
import { IExportManager } from '../exportManager/interfaces';
import { OperationStatus } from '../clients/jobManager/enums';

export type ExtendedRasterExportJobParameters = RasterExportJobParams & {
  exportId: number;
  exportManagementParams: {
    keywords: Record<string, unknown>;
    webhook: Webhook[];
  };
};

export type RasterJobExportResponse = ExportJobResponse & IJobResponse<ExtendedRasterExportJobParameters, unknown>;

export const createExportRequestSchema = z.object({
  dbId: z.string(),
  crs: z.string().optional(),
  priority: z.number().optional(),
  roi: roiFeatureCollectionSchema.optional(),
  callbackURLs: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export type CreateExportRequest = z.infer<typeof createExportRequestSchema>;

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

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<IExportTaskResponse<ExportJobParameters>> {
    try {
      this.logger.info({ msg: `Create export task request`, req: req });
      const requestedEPSG = `EPSG:${req.artifactCRS}`;
      const userInputRequest: CreatePackageParams = {
        roi: req.ROI,
        dbId: req.catalogRecordID,
        crs: requestedEPSG,
        description: req.description,
        callbackURLs: [this.serviceWebhookEndpoint],
      };

      const exportRequest: CreateExportRequest = createExportRequestSchema.parse(userInputRequest);
      const res = await this.exporterTriggerClient.createExportTask(exportRequest);
      const exportJob = (await this.jobManagerClient.getJobById(res.jobId)) as RasterJobExportResponse;

      //There is a completed job - return all necessary values
      if (res.status === OperationStatus.COMPLETED) {
        const completedExportTask = res as CallbackExportResponse;

        const task: IExportTaskResponse<ExportJobParameters> = {
          id: exportJob.parameters.id,
          catalogRecordID: completedExportTask.recordCatalogId,
          domain: Domain.RASTER,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          ROI: completedExportTask.roi,
          artifactCRS: EPSGDATA[4326].code,
          description: req.description,
          keywords: req.keywords,
          status: convertToUnifiedTaskStatus(completedExportTask.status),
          artifacts: completedExportTask.artifacts as Artifact[],
          createdAt: new Date(exportJob.created),
          finishedAt: new Date(exportJob.updated),
          expiredAt: completedExportTask.expirationTime,
          webhook: req.webhooks,
        };

        return task;
      } else {
        let createExportJobResponse: IExportTaskResponse<ExportJobParameters>;
        const exportTask = res as CreateExportJobTriggerResponse;
        //There is a duplicate running/in-progress job already - didn't create new one
        if (exportTask.isDuplicated === true) {
          createExportJobResponse = {
            id: exportJob.parameters.exportId,
            catalogRecordID: req.catalogRecordID,
            artifactCRS: EPSGDATA[4326].code,
            createdAt: new Date(exportJob.created),
            status: convertToUnifiedTaskStatus(exportTask.status),
            domain: Domain.RASTER,
            webhook: req.webhooks,
          };
          return createExportJobResponse;
        }

        //There is no duplicate or completed export job, created new one and update params
        const exportId = generateUniqueId();
        const updatedParams = { ...exportJob.parameters, exportId, exportManagementParams: { keywords: req.keywords, webhook: req.webhooks } };

        await this.jobManagerClient.updateJobParameters(res.jobId, updatedParams);
        createExportJobResponse = {
          id: exportId,
          catalogRecordID: req.catalogRecordID,
          artifactCRS: EPSGDATA[4326].code,
          createdAt: new Date(exportJob.created),
          status: TaskStatus.PENDING,
          domain: Domain.RASTER,
          webhook: req.webhooks,
        };
        return createExportJobResponse;
      }
    } catch (error) {
      const errMessage = `Failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async getTaskById(id: number): Promise<IExportTaskResponse<ExportJobParameters>> {
    this.logger.info({ msg: `get export task by id`, id });
    const job = await this.jobManagerClient.getJobByExportId(id);
    const jobParameters = job.parameters as ExtendedRasterExportJobParameters;
    const callbackParams = jobParameters.callbackParams;
    const webhook = jobParameters.exportManagementParams.webhook;
    const task: IExportTaskResponse<ExportJobParameters> = {
      id: id,
      catalogRecordID: job.internalId,
      domain: Domain.RASTER,
      artifactCRS: EPSGDATA[4326].code,
      description: job.description,
      status: job.isCleaned ? TaskStatus.EXPIRED : convertToUnifiedTaskStatus(job.status),
      progress: job.percentage,
      errorReason: job.reason,
      estimatedSize: jobParameters.additionalParams.gpkgEstimatedSize,
      artifacts: job.status === OperationStatus.COMPLETED && !job.isCleaned ? (callbackParams?.artifacts as Artifact[]) : undefined,
      createdAt: job.created,
      finishedAt: job.updated,
      expiredAt: job.status === OperationStatus.COMPLETED ? callbackParams?.expirationTime : undefined,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ROI: jobParameters.callbackParams?.roi,
      webhook: webhook,
    };

    return task;
  }
}
