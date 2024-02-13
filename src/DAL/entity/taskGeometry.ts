import { Entity, Column, PrimaryGeneratedColumn, MultiPolygon, Polygon, ManyToMany } from 'typeorm';
import { GeometryMetadata } from '@map-colonies/export-interfaces';
import { ITaskGeometriesEntity } from '../models/taskGeometry';
import { TaskEntity } from './task';

@Entity('task_geometry')
export class TaskGeometryEntity implements ITaskGeometriesEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToMany(() => TaskEntity)
  public tasks: TaskEntity[];

  @Column({ name: 'geom', type: 'geometry', nullable: false })
  public geometry: MultiPolygon | Polygon;

  @Column('jsonb', { nullable: true })
  public metadata: GeometryMetadata;
}
