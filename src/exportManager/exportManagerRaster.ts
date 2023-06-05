import { Logger } from '@map-colonies/js-logger';
import { CreateExportTaskRequest, IExportManager, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { Domain } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { BadRequestError } from '@map-colonies/error-types';
import { SERVICES } from '../common/constants';
import { ExporterTriggerClient } from '../clients/exporterTriggerClient';
import { CreateExportTaskExtendedRequest, CreatePackageParams } from '../tasks/models/tasksManager';
import { OperationStatus } from '../tasks/enums';
import { JobManagerClient } from '../clients/jobManagerClient';

export interface ILinkDefinition {
    dataURI: string;
    metadataURI: string;
}

export interface IFileNameDefinition {
  dataName: string;
  metadataName: string;
}

export interface WebhookParams {
    links: ILinkDefinition;
    expirationTime: Date;
    fileSize: number;
    fileNames: IFileNameDefinition;
    recordCatalogId: string;
    jobId: string;
    description?: string;
    roi: FeatureCollection,
    status: OperationStatus,
    errorReason?: string,
}

@injectable()
export class ExportManagerRaster {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, private readonly exporterTriggerClient: ExporterTriggerClient, private readonly jobManagerClient: JobManagerClient) {}

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<void> {
    try {
      const epsg = 'EPSG';
      const requestedEPSG = `${epsg}:${req.artifactCRS}`;
      this.logger.info({ msg: `create export task request`, req: req });
      const createPackageParams: CreatePackageParams = {
        roi: req.ROI,
        dbId: req.catalogRecordID,
        crs: requestedEPSG,
        description: req.description,
        callbackURLs: ["http://localhost:8080/export-tasks/webhook"],
      };
      console.log(createPackageParams.callbackURLs);
      const res = await this.exporterTriggerClient.createExportTask(createPackageParams);
      const exportJob = await this.jobManagerClient.getJobByType((res as {jobId: string}).jobId as string);
      const jobParameters = (res as {parameters: Record<string, unknown>}).parameters;
      const updatedParams = {...jobParameters, exportId: 75, keywords: {"test": "test"}};
      await this.jobManagerClient.updateJobParameters((res as {jobId: string}).jobId, updatedParams);
      console.log(exportJob, 'exportJob');
    } catch (error) {
      const errMessage = `Failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }
}
