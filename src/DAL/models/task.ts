import { TaskGeometry, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { Domain } from '@map-colonies/types';
import { ITaskCreate } from '../../tasks/interfaces';

export interface TaskModel extends ITaskCreate<TaskParameters> {
  jobId: string;
  clientName: string;
  domain: Domain;
  status: TaskStatus;
  taskGeometries: TaskGeometry[];
  estimatedDataSize?: number;
  estimatedTime?: number;
  percentage: number;
  reason?: string;
  createdAt: Date;
  expiredAt?: Date;
  finishedAt?: Date;
};