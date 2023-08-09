import { Domain, EPSGDATA, EpsgCode } from '@map-colonies/types';
import { Entity, Column, PrimaryColumn, UpdateDateColumn, Generated, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn, MultiPolygon, Polygon, ManyToMany } from 'typeorm';
import { GeometryMetadata, TaskStatus } from '@map-colonies/export-interfaces';
import { TaskEntity } from './task';

@Entity('task_geometry')
export class TaskGeometryEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @ManyToMany(
    () => TaskEntity
  )
  tasks: TaskEntity[];

  @Column({name: 'wkt_geometry', type: 'text', nullable: true})
  public geometry: MultiPolygon | Polygon;;

  @Column('jsonb', { nullable: true })
  public metadata: GeometryMetadata;
}
