import { Artifact, TaskEvent } from '@map-colonies/export-interfaces';
import { FeatureCollection } from 'geojson';
import { ExportJobParameters } from '../clients/jobManager/interfaces';
import { ITaskResponse } from '../tasks/interfaces';
import { CreateExportTaskExtendedRequest } from '../tasks/models/tasksManager';
import { ArtifactType } from './enum';
import { OperationStatus } from '../tasks/enums';

export interface Webhook {
  events: TaskEvent[];
  url: string;
}

export interface IArtifactDefinition {
  name: string;
  url?: string;
  size?: number;
  type: ArtifactType;
}

export interface ILinkDefinition {
  dataURI: string;
  metadataURI: string;
}

export interface ICallbackDataExportBase {
  links?: ILinkDefinition;
  expirationTime?: Date;
  fileSize?: number;
  recordCatalogId: string;
  jobId: string;
  errorReason?: string;
  description?: string;
  artifacts: Artifact[];
}

export interface ICallbackExportData extends ICallbackDataExportBase {
  roi: FeatureCollection;
  status: OperationStatus;
}

export interface IExportManager {
  createExportTask: (data: CreateExportTaskExtendedRequest) => Promise<ITaskResponse<ExportJobParameters>>;
  getTaskById: (id: number) => Promise<ITaskResponse<ExportJobParameters>>;
}
