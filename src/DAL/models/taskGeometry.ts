import { MultiPolygon, Polygon } from 'typeorm';
import { GeometryMetadata } from '@map-colonies/export-interfaces';
import { ITaskEntity } from './task';

export interface ITaskGeometriesEntity {
  /** The auto-generated ID of the task geometry. */
  id: number;
  /** The tasks relation of the tasks. */
  tasks?: ITaskEntity[];
  /** The geometry of the task. */
  geometry: MultiPolygon | Polygon;
  /** The metadata of the geometry. */
  metadata?: GeometryMetadata;
}
