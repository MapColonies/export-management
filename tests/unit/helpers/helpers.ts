import { Domain } from '@map-colonies/types';
import { CreateExportTaskRequest, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';

export const createFakeEntity: () => CreateExportTaskRequest<TaskParameters> = () => {
  return {
    artifactCRS: '4326',
    catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
    domain: Domain.RASTER,
    webhook: [{ url: 'http://localhost:8080/', events: [TaskEvent.TASK_COMPLETED] }],
  };
};
