/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Domain } from '@map-colonies/types';
import { TaskEvent, TaskStatus } from '@map-colonies/export-interfaces';
import { ITaskEntity } from '../../src/DAL/models/task';

export function getFakeTask(): ITaskEntity {
  return {
    id: 1,
    jobId: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
    catalogRecordID: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    customerName: 'cutomer_name',
    artifactCRS: '4326',
    domain: Domain.RASTER,
    status: TaskStatus.COMPLETED,
    description: 'string',
    estimatedDataSize: 205200,
    estimatedTime: 1352,
    webhook: [{ events: [TaskEvent.TASK_COMPLETED], url: 'http://localhost:8080' }],
    keywords: {
      foo: 'kuku',
    },
    percentage: 0,
    taskGeometries: [
      {
        geometry: {
          coordinates: [
            [
              [34.15428027392949, 30.5333653264712],
              [34.699875323172876, 30.5333653264712],
              [34.699875323172876, 30.91304561232323],
              [34.15428027392949, 30.91304561232323],
              [34.15428027392949, 30.5333653264712],
            ],
          ],
          type: 'Polygon',
        },
      },
    ],
  };
}
