import { GeoJSON } from 'geojson';
import { FeatureCollection } from '@turf/turf';
import {  Domain } from '../common/enums';
import { OperationStatus, TaskEventPartial, TaskStatus } from './enums';
import { Artifact, CreateExportTaskRequest } from '@map-colonies/export-interfaces';

export interface ITaskCreate<T> {
  catalogRecordID: string;
  domain: Domain;
  ROI?: FeatureCollection;
  artifactCRS: string;
  description?: string;
  keywords?: Record<string, unknown>;
  parameters?: T;
  webhook: IWebhook[];
}

export interface ITask<T> extends ITaskCreate<T> {
  id: number;
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

export interface IWebhook {
  event: TaskEventPartial;
  uri: string;
}

export interface IWebhookEvent<T> {
  event: TaskEventPartial;
  timestamp: Date;
  data: ITask<T>;
}


export declare type TaskParameters = Record<string, unknown>;
