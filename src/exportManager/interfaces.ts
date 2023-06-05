import { CreateExportTaskExtendedRequest } from "../tasks/models/tasksManager";

export interface IExportManager {
  createExportTask: (data: CreateExportTaskExtendedRequest) => Promise<void>;
}
