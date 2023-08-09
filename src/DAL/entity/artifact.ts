import { Domain, EPSGDATA, EpsgCode } from '@map-colonies/types';
import { Entity, Column, PrimaryColumn, UpdateDateColumn, Generated, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { TaskStatus } from '@map-colonies/export-interfaces';
import { TaskGeometryEntity } from './taskGeometry';
import { ArtifactTypeEntity } from './artifactType';
import { TaskEntity } from './task';

export type EpsgPartial = Extract<EpsgCode, '4326' | '3857'>;

@Entity('artifact')
export class ArtifactEntity {
  @PrimaryGeneratedColumn()
  public id: number;
  
  @Column('varchar', { nullable: false })
  public name: string;

  @ManyToOne(() => ArtifactTypeEntity, (artifactType) => artifactType.artifacts, { nullable: false })
  @JoinColumn({ name: 'artifact_type_id' })
  public artifactType: ArtifactTypeEntity;

  @ManyToMany(
    () => TaskEntity
  )
  tasks: TaskEntity[]

  @Column('varchar', { nullable: false })
  public url: string;

  @Column('numeric', { nullable: false, default: 0 })
  public size: number;

  public constructor();
  public constructor(init: Partial<ArtifactEntity>);
  public constructor(...args: [] | [Partial<ArtifactEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
