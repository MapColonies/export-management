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
import { ArtifactRasterType } from '@map-colonies/types';
import { SERVICES } from '../common/constants';
// TODO: removed when SDKis provided
import { geo1, geo2 } from './geoMocks';

@injectable()
export class ExportManagerRaster implements IExportManager {
  public constructor() {}

  public async createExportTask(req: CreateExportTaskRequest<TaskParameters>): Promise<CreateExportTaskResponse> {
    try {
      // TODO: Call Raster SDK here to get geometries & jobId
      const taskGeometries: TaskGeometry[] = [geo1, geo2];
      const jobId = 'de0dab85-6bc5-4b9f-9a64-9e61627d82d7';
      return {
        jobId,
        taskGeometries,
        expiredAt: new Date('2024-04-07T10:54:52.188Z'),
        progress: 100,
        status: TaskStatus.COMPLETED,
        artifacts: [
          { name: 'GPKG_TEST.gpkg', size: 343334, url: 'http://localhost:8080', type: ArtifactRasterType.METADATA, sha256: 'sdfsdfasdfasfasdf' },
        ],
      };
    } catch (error) {
      throw error;
    }
  }

  public async getEstimations(): Promise<GetEstimationsResponse> {
    try {
      // TODO: Call Raster SDK here to get geometries & jobId
      const estimatedFileSize = 205200;
      const estimatedTime = 1352;
      return {
        estimatedFileSize,
        estimatedTime,
      };
    } catch (error) {
      throw error;
    }
  }

  public async getFootprint(): Promise<FeatureCollection> {
    try {
      throw new Error('not implemented yet');
    } catch (error) {
      throw error;
    }
  }
}
