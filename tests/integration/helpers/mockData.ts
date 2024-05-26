/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */
import { TaskEvent, TaskStatus } from '@map-colonies/export-interfaces';
import { ArtifactRasterType, Domain } from '@map-colonies/types';
import { ITaskEntity } from '../../../src/DAL/models/tasks';
import { TaskRepository } from '../../../src/DAL/repositories/taskRepository';

export const insertMockPendingTask = async (repo: TaskRepository): Promise<ITaskEntity> => {
  const task = repo.create({
    catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d1',
    jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1841d',
    artifactCRS: '4326',
    domain: Domain.RASTER,
    customerName: 'unknown',
    ROI: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            maxResolutionDeg: 0.703125,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-180, -90],
                [180, 90],
                [180, 90],
                [180, -190],
                [-180, -90],
              ],
            ],
          },
        },
      ],
    },
    status: TaskStatus.PENDING,
    webhooks: [{ url: 'https://localhost:8080', events: [TaskEvent.TASK_COMPLETED], id: 1 }],
    createdAt: new Date(),
  });

  await repo.saveTask(task);
  return task;
};
export const insertMockCompletedTask = async (repo: TaskRepository): Promise<void> => {
  const task = repo.create({
    catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d1',
    jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1831e',
    artifactCRS: '4326',
    domain: Domain.RASTER,
    customerName: 'unknown',
    ROI: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            maxResolutionDeg: 0.703125,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-180, -90],
                [180, 90],
                [180, 90],
                [180, -190],
                [-180, -90],
              ],
            ],
          },
        },
      ],
    },
    status: TaskStatus.COMPLETED,
    progress: 100,
    webhooks: [],
    createdAt: new Date(),
    artifacts: [{ name: 'GPKG_TEST.gpkg', size: 343334, url: 'http://localhost:8080', type: ArtifactRasterType.GPKG, sha256: 'ft56hku7v5uijk6' }],
  });

  await repo.saveTask(task);
};

export const insertMockInProgressTask = async (repo: TaskRepository): Promise<void> => {
  const task = repo.create({
    catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d1',
    jobId: 'fd6bd061-0a31-4c2b-a074-81fe37d1831d',
    artifactCRS: '4326',
    domain: Domain.RASTER,
    customerName: 'unknown',
    ROI: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            maxResolutionDeg: 0.703125,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-180, -90],
                [180, 90],
                [180, 90],
                [180, -190],
                [-180, -90],
              ],
            ],
          },
        },
      ],
    },
    status: TaskStatus.IN_PROGRESS,
    progress: 55,
    webhooks: [{ url: 'https://localhost:8080', events: [TaskEvent.TASK_COMPLETED], id: 1 }],
    createdAt: new Date(),
  });

  await repo.saveTask(task);
};
