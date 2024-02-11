import { TaskStatus, Webhook } from '@map-colonies/export-interfaces';
import { Domain, EpsgCode } from '@map-colonies/types';
import { IArtifact } from './artifact';
import { ITaskGeometries } from './taskGeometry';

export interface ITaskEntity {
  /** The auto-generated ID of the artifact. */
  id: number;
  /** The catalog record id of the requested layer. */
  catalogRecordID: string;
  /** The unique job id of the task. */
  jobId: string;
  /** Contains all of the geometries on the ROI that given. */
  taskGeometries: ITaskGeometries[];
  /** The artifacts CRS of the requested source. */
  artifactCRS: EpsgCode;
  /** The artifacts relation of the task. */
  artifacts?: IArtifact[];
  /** The costumer that send the task. */
  customerName?: string;
  /** The domain that the task belongs to. */
  domain: Domain;
  /** list of requested webhooks actions of the task. */
  webhook: Webhook[];
  /** Status of the task. */
  status: TaskStatus;
  /** The Description of the task. */
  description: string;
  /** Free keywords to describe the task by the user. */
  keywords: Record<string, unknown>;
  /** The estimated data size. */
  estimatedSize?: number;
  /** The estimated time for the task to be completed. */
  estimatedTime?: number;
  /** The task current progress. */
  progress?: number;
  /** The errorReason that the task failed. */
  errorReason?: string;
  /** Automatically generated date when the given task was created. */
  createdAt: Date;
  /** Automatically update the date when the any progress or status has changed. */
  updatedAt?: Date;
  /** Automatically generated date that the task will be expired . */
  expiredAt?: Date;
  /** The date time that the task finished. */
  finishedAt?: Date;
}
