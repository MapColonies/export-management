import { MultiPolygon, Polygon } from 'typeorm';
import { GeometryMetadata } from '@map-colonies/export-interfaces';
import { TaskEntity } from '../entity';

export interface ITaskGeometries {
    /** The auto-generated ID of the artifact type. */
    id?: number;
    /** The tasks relation of the task geometries. */
    tasks?: TaskEntity[];
    /** The geometry of the task. */
    geometry: MultiPolygon | Polygon;
    /** The metadata of the geometry. */
    metadata?: GeometryMetadata;
}
