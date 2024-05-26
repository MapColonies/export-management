/* eslint-disable @typescript-eslint/require-await */
import {
  CreateExportTaskRequest,
  CreateExportTaskResponse,
  GetEstimationsResponse,
  IExportManager,
  TaskGeometry,
  TaskParameters,
  TaskStatus,
} from '@map-colonies/export-interfaces';
import { injectable } from 'tsyringe';
import { FeatureCollection } from '@turf/turf';
import { ArtifactDEMType } from '@map-colonies/types';
// TODO: removed when SDKis provided
import { geo1, geo2 } from './geoMocks';

@injectable()
export class ExportManagerRaster implements IExportManager {
  public async createExportTask(req: CreateExportTaskRequest<TaskParameters>): Promise<CreateExportTaskResponse> {
    try {
      // TODO: Call Raster SDK here to get geometries & jobId
      const taskGeometries: TaskGeometry[] = [geo1, geo2];
      const jobId = 'fd6bd061-0a31-4c2b-a074-81fe37d1831d';
      return {
        jobId,
        taskGeometries,
        expiredAt: new Date('2024-04-07T10:54:52.188Z'),
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
