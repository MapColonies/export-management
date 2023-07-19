import { Domain, EPSGDATA, EpsgCode } from '@map-colonies/types';
import { Entity, Column, PrimaryColumn, UpdateDateColumn, Generated, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '@map-colonies/export-interfaces';
import { TaskEntity } from './task';

type EpsgPartial = Extract<EpsgCode, '4326' | '3857'>;

@Entity('task_geometry')
export class TaskGeometryEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @ManyToOne(() => TaskEntity, (task) => task.taskGeometries, { nullable: false })
  @JoinColumn({ name: 'export_task_id' })
  public task: TaskEntity;

  @Column({name: 'wkt_geometry', type: 'text',nullable: true})
  public wktGeometry: string;

  @Column({name: 'wkb_geometry', type: 'geometry', spatialFeatureType: 'Geometry', srid: 4326,nullable: true})
  public wkbGeometry: string;

  @Column({name: 'footprint_geojson', type: 'text', nullable: false})
  public footprint: object;

  @Column('jsonb', { nullable: true })
  public metadata: object;
  

  public constructor();
  public constructor(init: Partial<TaskGeometryEntity>);
  public constructor(...args: [] | [Partial<TaskGeometryEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
