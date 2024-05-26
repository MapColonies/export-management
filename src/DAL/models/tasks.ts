/* eslint-disable @typescript-eslint/naming-convention */
import { Artifact, TaskStatus, Webhook } from '@map-colonies/export-interfaces';
import { Domain, EpsgCode } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { ITaskGeometriesEntity } from './taskGeometries';

export interface ITaskEntity {
  /** The auto-generated ID of the task. */
  id: number;
  /** The catalog record id of the requested layer. */
  catalogRecordID: string;
  /** The unique job id of the task. */
  jobId: string;
  /** Contains all of the geometries on the ROI that given. */
  taskGeometries: ITaskGeometriesEntity[];
  /** The artifacts CRS of the requested source. */
  artifactCRS: EpsgCode;
  /** The artifacts relation of the task. */
  artifacts?: Artifact[];
  /** The domain that the task belongs to. */
  domain: Domain;
  /** The domain that the task belongs to. */
  ROI?: FeatureCollection;
  /** The requested cutomer name that the task belongs to. */
  customerName: string;
  /** list of requested webhooks actions of the task. */
  webhooks: Webhook[];
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
