import { Domain, EPSGDATA, EpsgCode } from '@map-colonies/types';
import { Entity, Column, PrimaryColumn, UpdateDateColumn, Generated, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '@map-colonies/export-interfaces';
import { TaskEntity } from './task';

type EpsgPartial = Extract<EpsgCode, '4326' | '3857'>;

@Entity('task')
export class TaskGeometryEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @ManyToOne(() => TaskEntity, (task) => task.taskGeometries, { nullable: false })
  @JoinColumn({ name: 'export_task_id' })
  public task: TaskEntity;

  // @ManyToOne(() => JobEntity, (job) => job.tasks, { nullable: false })
  // @JoinColumn({ name: 'jobId' })
  // public job: JobEntity;

  @Column({ name: 'catalog_record_id', nullable: false, type: 'uuid' })
  public catalogRecordId: string;

  @Column('varchar', {name: 'artifact_crs', nullable: false })
  public artifactCRS: EpsgPartial;

  @Column('varchar', {name: 'domain', nullable: false })
  public domain: Domain;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING, nullable: false })
  public status: TaskStatus;

  @Column('varchar', { length: 2000, nullable: true })
  public description: string;

  @Column('jsonb', { nullable: true })
  public keywords: Record<string, unknown>;

  @Column('varchar', { nullable: true })
  public reason: string;

  @Column('smallint', { nullable: true })
  public percentage: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone'
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: 'expired_at',
    type: 'timestamp with time zone'
  })
  public expiredAt: Date;

  @UpdateDateColumn({
    name: 'finished_at',
    type: 'timestamp with time zone'
  })
  public finishedAt: Date;

  public constructor();
  public constructor(init: Partial<TaskEntity>);
  public constructor(...args: [] | [Partial<TaskEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
