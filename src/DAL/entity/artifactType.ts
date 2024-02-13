import { Entity, Column, JoinColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Artifact3DType, ArtifactDEMType, ArtifactRasterType } from '@map-colonies/types';
import { IArtifactTypeEntity } from '../models/artifactType';
import { ArtifactEntity } from './artifact';

export declare type AtrifactType = ArtifactDEMType | ArtifactRasterType | Artifact3DType;
@Entity('artifact_type')
export class ArtifactTypeEntity implements IArtifactTypeEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar', { nullable: false })
  public type: AtrifactType;

  @OneToMany(() => ArtifactEntity, (artifact) => artifact.type, { cascade: true })
  @JoinColumn()
  public artifacts?: ArtifactEntity[];
}
