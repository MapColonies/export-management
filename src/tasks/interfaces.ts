import { GeoJSON } from 'geojson';
import { FeatureCollection } from '@turf/turf';
import { Domain } from '@map-colonies/types';
import { Artifact, TaskEvent, Webhook } from '@map-colonies/export-interfaces';
import { OperationStatus } from './enums';

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

export interface ITask<T> extends Partial<ITaskCreate<T>> {
  id: number;
  estimatedSize?: number;
  estimatedTime?: number;
  footprint?: GeoJSON;
  totalSize?: number;
  status: OperationStatus; // TBD => use TaskStatus in future version
  progress?: number;
  artifacts?: Artifact[];
  createdAt: Date;
  expiredAt?: Date;
  finishedAt?: Date;
}

export interface WebhookEvent<T> {
  event: TaskEvent;
  timestamp: Date;
  data: ITask<T>;
}

export declare type TaskParameters = Record<string, unknown>;
