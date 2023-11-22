import { Logger } from '@map-colonies/js-logger';
import { Artifact } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import config from 'config';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { generateUniqueId } from '../common/utils';
import { SERVICES } from '../common/constants';
import { CreateExportJobTriggerResponse, ExporterTriggerClient } from '../clients/exporterTriggerClient';
import { CreateExportTaskExtendedRequest, CreatePackageParams } from '../tasks/models/tasksManager';
import { OperationStatus } from '../tasks/enums';
import { ExportJobParameters, JobManagerClient } from '../clients/jobManagerClient';
import { ITaskResponse } from '../tasks/interfaces';
import { IExportManager } from '../exportManager/interfaces';

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
          status: (res as WebhookParams).status,
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
            status: (res as WebhookParams).status,
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
          status: (res as WebhookParams).status,
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

  public async getTaskById(id: number) {
    this.logger.info({ msg: `get export task by id`, id });
    const job = await this.jobManagerClient.getJobByExportId(id)
    console.log("job", job)
    return job;
  }
}
