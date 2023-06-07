import { GeoJSON } from 'geojson';
import { FeatureCollection } from '@turf/turf';
import {  Domain } from '../common/enums';
import { OperationStatus } from './enums';
import { Artifact, TaskEvent, Webhook } from '@map-colonies/export-interfaces';

export interface ITaskCreate<T> {
  catalogRecordID: string;
  domain: Domain;
  ROI?: FeatureCollection;
  artifactCRS: string;
  description?: string;
  keywords?: Record<string, unknown>;
  parameters?: T;
  webhook: Webhook[];
}

export interface ITask<T> extends Partial<ITaskCreate<T>> {
  exportId: number;
  estimatedSize?: number;
  estimatedTime?: number;
  footprint?: GeoJSON;
  totalSize?: number;
  status: OperationStatus; // TBD => use TaskStatus in future version
  progress?: number;
  artifacts: Artifact[];
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
