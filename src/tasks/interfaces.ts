import { GeoJSON } from 'geojson';
import { FeatureCollection } from '@turf/turf';
import { Domain } from '@map-colonies/types';
import { Artifact, TaskEvent, TaskStatus, Webhook } from '@map-colonies/export-interfaces';

export interface ITaskCreate<T> {
  catalogRecordID: string;
  domain: Domain;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ROI?: FeatureCollection;
  artifactCRS: string;
  description?: string;
  keywords?: Record<string, unknown>;
  parameters?: T;
  webhook: Webhook[];
}

export interface ITaskResponse<T> extends ITaskCreate<T> {
  id: number;
  estimatedSize?: number;
  estimatedTime?: number;
  footprint?: GeoJSON;
  totalSize?: number;
  status: TaskStatus;
  progress?: number;
  artifacts?: Artifact[];
  createdAt: Date;
  expiredAt?: Date;
  finishedAt?: Date;
  errorReason?: string;
}

export interface WebhookEvent<T> {
  event: TaskEvent;
  timestamp: Date;
  data: ITaskResponse<T>;
}

export declare type TaskParameters = Record<string, unknown>;
