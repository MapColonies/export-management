/* eslint-disable @typescript-eslint/naming-convention */
import { Domain, EpsgCode } from '@map-colonies/types';
import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  BaseEntity,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TaskStatus } from '@map-colonies/export-interfaces';
import { FeatureCollection } from '@turf/turf';
import { ITaskEntity } from '../models/tasks';
import { TaskGeometryEntity } from './taskGeometries';
import { ArtifactEntity } from './artifacts';
import { WebhookEntity } from './webhooks';

@Entity('Tasks')
export class TaskEntity extends BaseEntity implements ITaskEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'job_id', nullable: false, type: 'uuid' })
  public jobId: string;

  @Column({ name: 'catalog_record_id', nullable: false, type: 'uuid' })
  public catalogRecordID: string;

  @Column('varchar', { name: 'artifact_crs', nullable: false })
  public artifactCRS: EpsgCode;

  @Column('varchar', { name: 'domain', nullable: false })
  public domain: Domain;

  @Column('jsonb', { nullable: true })
  public ROI: FeatureCollection;

  @Column('varchar', { name: 'customer_name', nullable: true })
  public customerName: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING, nullable: false })
  public status: TaskStatus;

  @Column('varchar', { length: 2000, nullable: true })
  public description: string;

  @Column('integer', { name: 'estimated_data_size', nullable: true, default: 0 })
  public estimatedFileSize: number;

  @Column('integer', { name: 'estimated_time', nullable: true, default: 0 })
  public estimatedTime: number;

  @Column('jsonb', { nullable: true })
  public keywords: Record<string, unknown>;

  @Column('varchar', { name: 'error_reason', nullable: true })
  public errorReason: string;

  @Column('smallint', { nullable: true, default: 0 })
  public progress: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  public updatedAt: Date;

  @Column({
    name: 'expired_at',
    type: 'timestamptz',
    nullable: true,
  })
  public expiredAt: Date;

  @Column({
    name: 'finished_at',
    type: 'timestamptz',
    nullable: true,
  })
  public finishedAt: Date;

  @OneToMany(() => TaskGeometryEntity, (taskGeometry) => taskGeometry.task, { cascade: true })
  @JoinColumn()
  public taskGeometries: TaskGeometryEntity[];

  @ManyToMany(() => ArtifactEntity, { cascade: true })
  @JoinTable({
    name: 'AftifactToTask',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'artifact_id',
      referencedColumnName: 'id',
    },
  })
  public artifacts: ArtifactEntity[];

  @OneToMany(() => WebhookEntity, (webhook) => webhook.task, { cascade: true })
  @JoinColumn()
  public webhooks: WebhookEntity[];
}
