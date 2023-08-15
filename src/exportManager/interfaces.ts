import { CreateExportTaskRequest, CreateExportTaskResponse, GetEstimationsRequest, GetEstimationsResponse, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';

export interface Webhook {
  events: TaskEvent[];
  url: string;
}
export interface IExportManager {
  getEstimations: (params?: GetEstimationsRequest) => Promise<GetEstimationsResponse>;
  createExportTask: (data: CreateExportTaskRequest<TaskParameters>) => Promise<CreateExportTaskResponse>;
}
