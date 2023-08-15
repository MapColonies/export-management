import { EpsgCode } from '@map-colonies/types';
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
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
  public type: ArtifactTypeEntity;

  @ManyToMany(() => TaskEntity)
  public tasks: TaskEntity[];

  @Column('varchar', { nullable: false })
  public url: string;

  @Column('numeric', { nullable: false, default: 0 })
  public size: number;
}
