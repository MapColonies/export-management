/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TaskGeometry } from '@map-colonies/export-interfaces';

export const geo1: TaskGeometry = {
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
  metadata: { maxResolutionDeg: 0.072 },
};

export const geo2: TaskGeometry = {
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
  metadata: { maxResolutionDeg: 0.03333 },
};
