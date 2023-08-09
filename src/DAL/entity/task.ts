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
  BaseEntity,
} from 'typeorm';
import { TaskStatus } from '@map-colonies/export-interfaces';
import { TaskGeometryEntity } from './taskGeometry';
import { ArtifactEntity, EpsgPartial } from './artifact';
import { WebhookEntity } from './webhook';


@Entity('task')
export class TaskEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  // add column explicitly here for type ORM bug - https://github.com/typeorm/typeorm/issues/586
  @Column({ name: 'job_id', nullable: false, type: 'uuid' })
  public jobId: string;

  @ManyToMany(() => TaskGeometryEntity, {cascade: true})
  @JoinTable({
    name: 'task_geometry_to_task',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'task_geometry_id',
      referencedColumnName: 'id',
    },
  })
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

  @ManyToMany(() => WebhookEntity, {cascade: true})
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
  webhook: WebhookEntity[];

  @Column({ name: 'catalog_record_id', nullable: false, type: 'uuid' })
  public catalogRecordID: string;

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

  @Column('numeric', { nullable: true, default: 0 })
  public estimatedDataSize: number;

  @Column('numeric', { nullable: true, default: 0 })
  public estimatedTime: number;

  @Column('jsonb', { nullable: true })
  public keywords: Record<string, unknown>;

  @Column('varchar', { nullable: true })
  public reason: string;

  @Column('smallint', { nullable: true })
  public percentage: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  public createdAt: Date;

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
}
