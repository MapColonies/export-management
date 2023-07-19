import { Domain, EPSGDATA, EpsgCode } from '@map-colonies/types';
import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  Generated,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { TaskStatus } from '@map-colonies/export-interfaces';
import { TaskGeometryEntity } from './taskGeometry';
import { ArtifactEntity } from './artifact';
import { WebhookEntity } from './webhook';

type EpsgPartial = Extract<EpsgCode, '4326' | '3857'>;

@Entity('task')
export class TaskEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  // add column explicitly here for type ORM bug - https://github.com/typeorm/typeorm/issues/586
  @Column({ name: 'job_id', nullable: false, type: 'uuid' })
  public jobId: string;

  @OneToMany(() => TaskGeometryEntity, (taskGeometry) => taskGeometry.task, { nullable: false, cascade: true })
  @JoinColumn()
  public taskGeometries: TaskGeometryEntity[];

  @ManyToMany(() => ArtifactEntity)
  @JoinTable({
    name: 'aftifact_to_task',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'artifact_id',
      referencedColumnName: 'id',
    },
  })
  artifacts: ArtifactEntity[];

  @ManyToMany(() => WebhookEntity)
  @JoinTable({
    name: 'webhook_to_task',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'webhook_id',
      referencedColumnName: 'id',
    },
  })
  webhooks: WebhookEntity[];

  @Column({ name: 'catalog_record_id', nullable: false, type: 'uuid' })
  public catalogRecordId: string;

  @Column('varchar', { name: 'client_name', nullable: false })
  public clientName: string;

  @Column('varchar', { name: 'artifact_crs', nullable: false })
  public artifactCRS: EpsgPartial;

  @Column('varchar', { name: 'domain', nullable: false })
  public domain: Domain;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING, nullable: false })
  public status: TaskStatus;

  @Column('varchar', { length: 2000, nullable: true })
  public description: string;

  @Column('jsonb', { nullable: true })
  public keywords: object;

  @Column('varchar', { nullable: true })
  public reason: string;

  @Column('smallint', { nullable: true })
  public percentage: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: 'expired_at',
    type: 'timestamp with time zone',
  })
  public expiredAt: Date;

  @UpdateDateColumn({
    name: 'finished_at',
    type: 'timestamp with time zone',
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
