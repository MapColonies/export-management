import { Logger } from '@map-colonies/js-logger';
import { Artifact, CreateExportTaskRequest, CreateExportTaskResponse, GetEstimationsResponse, TaskGeometry, TaskParameters } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { FeatureCollection } from '@turf/turf';
import { SERVICES } from '../common/constants';
import { OperationStatus } from '../tasks/enums';
import { IExportManager } from '../exportManager/interfaces';
import { geo1, geo2 } from './geoMocks';

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
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
  ) {}

  public async createExportTask(req: CreateExportTaskRequest<TaskParameters>): Promise<CreateExportTaskResponse> {
    try {
      this.logger.info({ msg: `Creating export task`, req: req });
      // TODO: Call Raster SDK here to get geometries & jobId
      const geometries: TaskGeometry[] = [geo1, geo2];
      const jobId = 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9';
      return await {
        jobId,
        geometries,
      };
    } catch (error) {
      const errMessage = `Failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async getEstimations(): Promise<GetEstimationsResponse> {
    try {
      this.logger.info({ msg: `get export task estimations`});
      // TODO: Call Raster SDK here to get geometries & jobId
      const estimatedFileSize = 205200;
      const estimatedTime = 1352;
      return await {
        estimatedFileSize,
        estimatedTime,
      };
    } catch (error) {
      const errMessage = `Failed to get export estimations: ${(error as Error).message}`;
      this.logger.error({ err: error, msg: errMessage });
      throw error;
    }
  }
}
