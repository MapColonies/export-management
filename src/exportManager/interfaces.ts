import { TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { ExportJobParameters } from '../clients/jobManagerClient';
import { ITaskResponse } from '../tasks/interfaces';
import { CreateExportTaskExtendedRequest } from '../tasks/models/tasksManager';

export interface Webhook {
  events: TaskEvent[];
  url: string;
}
export interface IExportManager {
  createExportTask: (data: CreateExportTaskExtendedRequest) => Promise<void>;
}
