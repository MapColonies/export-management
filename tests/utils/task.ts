
import { Domain } from '@map-colonies/types';
import { TaskEvent } from '@map-colonies/export-interfaces';
import { ITaskEntity } from '../../src/DAL/models/task';
import { geo1 } from '../../src/exportManager/geoMocks';

export function getFakeTask(): ITaskEntity {
  return {
    artifactCRS: '4326',
    catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
    customerName: 'Customer name',
    domain: Domain.RASTER,
    jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d8',
    taskGeometries: [geo1],
    webhook: [{url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED]}]
  };
}
