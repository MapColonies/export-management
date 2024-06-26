import { Artifact3DType, ArtifactDEMType, ArtifactRasterType, EpsgCode } from '@map-colonies/types';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { IArtifactEntity } from '../models/artifact';
import { TaskEntity } from './tasks';

export type EpsgPartial = Extract<EpsgCode, '4326' | '3857'>;
export declare type ArtifactType = ArtifactDEMType | ArtifactRasterType | Artifact3DType;
@Entity('Artifacts')
export class ArtifactEntity implements IArtifactEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar', { nullable: false })
  public name: string;

  @Column({ type: 'varchar', nullable: false })
  public type: ArtifactType;

  @ManyToMany(() => TaskEntity)
  public tasks: TaskEntity[];

  @Column('varchar', { nullable: false })
  public url: string;

  @Column('integer', { nullable: false, default: 0 })
  public size: number;

  @Column('varchar', { nullable: true })
  public sha256: string;
}
