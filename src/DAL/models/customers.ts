import { MultiPolygon, Polygon } from 'typeorm';
import { GeometryMetadata } from '@map-colonies/export-interfaces';
import { ITaskEntity } from './tasks';

export interface ICustomerEntity {
  /** The auto-generated ID of the task geometry. */
  id: number;
  /** The requested customer name. */
  customerName: string;
}
