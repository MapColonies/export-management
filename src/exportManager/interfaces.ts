import { ExportJobParameters } from '../clients/jobManager/interfaces';
import { IExportTaskResponse } from '../tasks/interfaces';
import { CreateExportTaskExtendedRequest } from '../tasks/models/tasksManager';

export interface IExportManager {
  createExportTask: (data: CreateExportTaskExtendedRequest) => Promise<IExportTaskResponse<ExportJobParameters>>;
  getTaskById: (id: number) => Promise<IExportTaskResponse<ExportJobParameters>>;
}
