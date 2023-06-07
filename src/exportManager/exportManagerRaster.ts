import { Logger } from '@map-colonies/js-logger';
import { Artifact, CreateExportTaskRequest, TaskEvent, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { BadRequestError } from '@map-colonies/error-types';
import { SERVICES } from '../common/constants';
import { ExporterTriggerClient } from '../clients/exporterTriggerClient';
import { CreateExportTaskExtendedRequest, CreatePackageParams } from '../tasks/models/tasksManager';
import { OperationStatus } from '../tasks/enums';
import { JobManagerClient } from '../clients/jobManagerClient';
import { Webhook } from './interfaces';
import { ITask, WebhookEvent } from '../tasks/interfaces';
import { IExportManager } from '../exportManager/interfaces';

export interface ILinkDefinition {
  dataURI: string;
  metadataURI: string;
}

export interface IFileNameDefinition {
  dataName: string;
  metadataName: string;
}

export interface WebhookParams {
  expirationTime: Date;
  recordCatalogId: string;
  jobId: string;
  description?: string;
  artifacts: Artifact[];
  roi: FeatureCollection;
  status: OperationStatus;
  errorReason?: string;
}

export interface CreateExportJobResponse {
  exportId: number;
}

@injectable()
export class ExportManagerRaster implements IExportManager {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    private readonly exporterTriggerClient: ExporterTriggerClient,
    private readonly jobManagerClient: JobManagerClient,
    private readonly serviceUrl: string
  ) {}

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<CreateExportJobResponse | WebhookEvent<TaskParameters>> {
    try {
      const epsg = 'EPSG';
      const requestedEPSG = `${epsg}:${req.artifactCRS}`;
      this.logger.info({ msg: `Create export task request`, req: req });
      const createPackageParams: CreatePackageParams = {
        roi: req.ROI,
        dbId: req.catalogRecordID,
        crs: requestedEPSG,
        description: req.description,
        callbackURLs: ['http://localhost:8080/export-tasks/webhook'],
      };
      const res = await this.exporterTriggerClient.createExportTask(createPackageParams);
      const exportJob = await this.jobManagerClient.getJobById((res as { jobId: string }).jobId as string);

      if ((res as WebhookParams).status === OperationStatus.COMPLETED) {
        const jobParameters = (exportJob as { parameters: Record<string, unknown> }).parameters;
        const task: ITask<TaskParameters> = {
          exportId: (jobParameters as { exportId: number }).exportId, // TBD
          catalogRecordID: (res as WebhookParams).recordCatalogId,
          domain: Domain.RASTER, // TBD
          ROI: (res as WebhookParams).roi,
          artifactCRS: EPSGDATA[4326].code, // TBD
          description: req.description,
          keywords: req.keywords,
          status: (res as WebhookParams).status,
          artifacts: (res as WebhookParams).artifacts,
          createdAt: (jobParameters as { created: Date }).created, // TODO: handle string date from db to date type
          finishedAt: (jobParameters as { updated: Date }).updated, // TODO: handle string date from db to date type
          expiredAt: (res as WebhookParams).expirationTime,
        };
        const webhookEvent: WebhookEvent<TaskParameters> = {
          data: task,
          event: (res as WebhookParams).status === OperationStatus.COMPLETED ? TaskEvent.TASK_COMPLETED : TaskEvent.TASK_FAILED,
          timestamp: new Date(),
        };
        return webhookEvent;
      } else {
        console.log('CREATE NEW TASK TYPE');
        console.log('result : ', res);
        const jobParameters = (exportJob as { parameters: Record<string, unknown> }).parameters;
        const exportId = new Date().getUTCMilliseconds();
        const updatedParams = { ...jobParameters, exportId: exportId, keywords: req.keywords, webhook: req.webhook };
        await this.jobManagerClient.updateJobParameters((res as { jobId: string }).jobId, updatedParams);

        const createExportJobResponse: CreateExportJobResponse = {
          exportId: exportId,
        };   
        return createExportJobResponse;
      }
    } catch (error) {
      const errMessage = `Failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }
}
