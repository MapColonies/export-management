import { CreateExportTaskRequest, TaskGeometry, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { Domain } from '@map-colonies/types';

export interface ITaskEntity extends CreateExportTaskRequest<TaskParameters> {
  jobId: string;
  customerName: string;
  domain: Domain;
  taskGeometries: TaskGeometry[];
  status?: TaskStatus;
  estimatedDataSize?: number;
  estimatedTime?: number;
  percentage?: number;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  expiredAt?: Date;
  finishedAt?: Date;
}
