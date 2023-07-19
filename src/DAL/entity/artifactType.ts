import { Domain, EPSGDATA, EpsgCode } from '@map-colonies/types';
import { Entity, Column, PrimaryColumn, UpdateDateColumn, Generated, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { ArtifactEntity } from './artifact';

@Entity('artifact_type')
export class ArtifactTypeEntity {
  @PrimaryGeneratedColumn()
  public id: number;
  
  @Column('varchar', { nullable: false })
  public type: string;

  @OneToMany(() => ArtifactEntity, (artifact) => artifact.artifactType, { nullable: false , cascade: true})
  @JoinColumn()
  public artifacts: ArtifactEntity[];

  public constructor();
  public constructor(init: Partial<ArtifactTypeEntity>);
  public constructor(...args: [] | [Partial<ArtifactTypeEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
