import { MultiPolygon, Polygon } from 'typeorm';
import { GeometryMetadata, TaskGeometry } from '@map-colonies/export-interfaces';
import { ITaskEntity } from './tasks';

export interface ITaskGeometriesEntity extends TaskGeometry {
  /** The auto-generated ID of the task geometry. */
  id: number;
  /** The tasks relation of the tasks. */
  task: ITaskEntity;
}
