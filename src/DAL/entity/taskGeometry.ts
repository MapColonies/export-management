import { Entity, Column, PrimaryGeneratedColumn, MultiPolygon, Polygon, ManyToMany } from 'typeorm';
import { GeometryMetadata } from '@map-colonies/export-interfaces';
import { ITaskGeometries } from '../models/taskGeometry';
import { TaskEntity } from './task';

@Entity('task_geometry')
export class TaskGeometryEntity implements ITaskGeometries {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToMany(() => TaskEntity)
  public tasks: TaskEntity[];

  @Column({ name: 'wkt_geometry', type: 'text', nullable: true })
  public geometry: MultiPolygon | Polygon;

  @Column('jsonb', { nullable: true })
  public metadata: GeometryMetadata;
}
