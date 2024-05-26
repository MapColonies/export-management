/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */
import { Domain } from '@map-colonies/types';
import { CreateExportTaskRequest, GetEstimationsResponse, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';

export const mockExportTaskRequest: () => CreateExportTaskRequest<TaskParameters> = () => {
  return {
    ROI: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            maxResolutionDeg: 0.0439453125,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [34.82836896556114, 32.03918441418732],
                [34.81210152170695, 32.03918441418732],
                [34.81210152170695, 32.02539369969462],
                [34.82836896556114, 32.02539369969462],
                [34.82836896556114, 32.03918441418732],
              ],
            ],
          },
        },
      ],
    },
    artifactCRS: '4326',
    catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
    domain: Domain.RASTER,
    webhooks: [{ url: 'http://localhost:8080/', events: [TaskEvent.TASK_COMPLETED] }],
  };
};

export const getEstimationsResponse: GetEstimationsResponse = {
  estimatedFileSize: 20000,
  estimatedTime: 50000,
};
