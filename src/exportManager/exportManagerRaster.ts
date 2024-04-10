/* eslint-disable @typescript-eslint/require-await */
import { Logger } from '@map-colonies/js-logger';
import {
  CreateExportTaskRequest,
  CreateExportTaskResponse,
  GetEstimationsResponse,
  IExportManager,
  TaskGeometry,
  TaskParameters,
  TaskStatus,
} from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { FeatureCollection } from '@turf/turf';
import { SERVICES } from '../common/constants';
// TODO: removed when SDKis provided
import { geo1, geo2 } from './geoMocks';
import { ArtifactRasterType } from '@map-colonies/types';

@injectable()
export class ExportManagerRaster implements IExportManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}

  public async createExportTask(req: CreateExportTaskRequest<TaskParameters>): Promise<CreateExportTaskResponse> {
    try {
      this.logger.info({ msg: `creating export task`, req });
      // TODO: Call Raster SDK here to get geometries & jobId
      const taskGeometries: TaskGeometry[] = [geo1, geo2];
      const jobId = 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9';
      return {
        jobId,
        taskGeometries,
        expiredAt: new Date("2024-04-07T10:54:52.188Z"),
        progress: 58,
        status: TaskStatus.IN_PROGRESS,
        // artifacts: [{name: 'GPKG_TEST.gpkg', size: 343334, url: 'http://localhost:8080', type: ArtifactRasterType.METADATA, sha256: 'sdfsdfasdfasfasdf'}]
      };
    } catch (error) {
      const errMessage = `failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async getEstimations(): Promise<GetEstimationsResponse> {
    try {
      this.logger.info({ msg: `get export task estimations` });
      // TODO: Call Raster SDK here to get geometries & jobId
      const estimatedFileSize = 205200;
      const estimatedTime = 1352;
      return {
        estimatedFileSize,
        estimatedTime,
      };
    } catch (error) {
      const errMessage = `failed to get export estimations: ${(error as Error).message}`;
      this.logger.error({ err: error, msg: errMessage });
      throw error;
    }
  }

  public async getFootprint(): Promise<FeatureCollection> {
    try {
      this.logger.info({ msg: `get footprint request` });
      throw new Error('not implemented yet');
    } catch (error) {
      const errMessage = `failed to get foo: ${(error as Error).message}`;
      this.logger.error({ err: error, msg: errMessage });
      throw error;
    }
  }
}
