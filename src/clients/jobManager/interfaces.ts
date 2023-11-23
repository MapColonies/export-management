import { Webhook } from '@map-colonies/export-interfaces';
import { FeatureCollection } from 'geojson';
import { OperationStatus } from './enums';

// This interfaces file is not relevant when unifined export implementation will be ready, this file should be deleted.

// eslint-disable-next-line import/exports-last
export interface ExportJobParameters {
  id: number;
  keywords: Record<string, unknown>;
  webhook: Webhook[];
}

// eslint-disable-next-line import/exports-last
export interface ExportJobResponse {
  parameters: ExportJobParameters;
  created: string;
  updated: string;
}

export interface GetJobByExportIdRequest {
  id: number;
}

export interface IGetTaskResponse {
  id: string;
  jobId: string;
  description?: string;
  parameters?: Record<string, unknown>;
  created: Date;
  updated: Date;
  type: string;
  status?: OperationStatus;
  percentage?: number;
  reason?: string;
  attempts: number;
  resettable: boolean;
}

export type GetTasksResponse = IGetTaskResponse[];

export interface IAvailableActions {
  isAbortable: boolean;
  isResumable: boolean;
}

export type FindJobsResponse = IGetJobResponse[];
export interface IGetJobResponse {
  id: string;
  resourceId: string;
  version: string;
  type: string;
  description?: string;
  parameters: Record<string, unknown>;
  reason?: string;
  tasks?: GetTasksResponse;
  created: Date;
  updated: Date;
  status: OperationStatus;
  percentage?: number;
  isCleaned: boolean;
  priority?: number;
  internalId: string;
  producerName?: string;
  productName?: string;
  productType?: string;
  taskCount: number;
  completedTasks: number;
  failedTasks: number;
  expiredTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  abortedTasks: number;
  additionalIdentifiers?: string;
  expirationDate?: Date;
  domain: string;
  availableActions?: IAvailableActions;
  gpkgEstimatedSize?: number;
  roi?: FeatureCollection;
}
