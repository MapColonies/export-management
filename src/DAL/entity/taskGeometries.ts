import { Entity, Column, PrimaryGeneratedColumn, MultiPolygon, Polygon, ManyToMany, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { GeometryMetadata } from '@map-colonies/export-interfaces';
import { ITaskGeometriesEntity } from '../models/taskGeometries';
import { TaskEntity } from './tasks';
import { ITaskEntity } from '../models/tasks';

@Entity('TaskGeometries')
export class TaskGeometryEntity implements ITaskGeometriesEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => TaskEntity, (task) => task.taskGeometries)
  @JoinColumn({name: 'task_id'})
  public task: ITaskEntity;

  @Column({ name: 'geom', type: 'geometry', nullable: false })
  public geometry: MultiPolygon | Polygon;

  @Column('jsonb', { nullable: true })
  public metadata: GeometryMetadata;
}
