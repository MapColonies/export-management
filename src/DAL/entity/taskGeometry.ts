import { Entity, Column, PrimaryGeneratedColumn, MultiPolygon, Polygon, ManyToMany } from 'typeorm';
import { GeometryMetadata } from '@map-colonies/export-interfaces';
import { TaskEntity } from './task';

@Entity('task_geometry')
export class TaskGeometryEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @ManyToMany(() => TaskEntity)
  public tasks: TaskEntity[];

  @Column({ name: 'wkt_geometry', type: 'text', nullable: true })
  public geometry: MultiPolygon | Polygon;

  @Column('jsonb', { nullable: true })
  public metadata: GeometryMetadata;
}
