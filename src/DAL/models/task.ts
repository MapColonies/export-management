import { CreateExportTaskRequest, TaskParameters, TaskStatus } from '@map-colonies/export-interfaces';
import { Domain } from '@map-colonies/types';
import { IArtifact } from './artifact';
import { ITaskGeometries } from './taskGeometry';

export interface ITaskEntity extends CreateExportTaskRequest<TaskParameters> {
  /** The auto-generated ID of the artifact. */
  id?: number
  /** The unique job id of the task. */
  jobId: string;
  /** Contains all of the geometries on the ROI that given. */
  taskGeometries: ITaskGeometries[];
  /** The artifacts relation of the task. */
  artifacts?: IArtifact[]
  /** The costumer that send the task. */
  customerName?: string;
  /** The domain that the task belongs to. */
  domain: Domain;
  /** Status of the task. */
  status?: TaskStatus;
  /** The estimated data size. */
  estimatedDataSize?: number;
  /** The estimated time for the task to be completed. */
  estimatedTime?: number;
  /** The task current percentage. */
  percentage?: number;
  /** The reason that the task failed. */
  reason?: string;
  /** Automatically generated date when the given task was created. */
  createdAt?: Date;
  /** Automatically update the date when the any progress or status has changed. */
  updatedAt?: Date;
  /** Automatically generated date that the task will be expired . */
  expiredAt?: Date;
  /** The date time that the task finished. */
  finishedAt?: Date;
}
