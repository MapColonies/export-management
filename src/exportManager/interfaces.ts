import { CreateExportTaskResponse, TaskEvent, TaskParameters } from "@map-colonies/export-interfaces";
import { WebhookEvent } from "../tasks/interfaces";
import { CreateExportTaskExtendedRequest } from "../tasks/models/tasksManager";
import { CreateExportJobResponse } from "./exportManagerRaster";

export interface Webhook {
  events: TaskEvent;
  url: string;
}
export interface IExportManager {
  createExportTask: (data: CreateExportTaskExtendedRequest) => Promise<CreateExportJobResponse | WebhookEvent<TaskParameters>>;
}
