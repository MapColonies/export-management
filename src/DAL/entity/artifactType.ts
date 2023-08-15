import { Entity, Column, JoinColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ArtifactEntity } from './artifact';

@Entity('artifact_type')
export class ArtifactTypeEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar', { nullable: false })
  public type: string;

  @OneToMany(() => ArtifactEntity, (artifact) => artifact.type, { nullable: false, cascade: true })
  @JoinColumn()
  public artifacts: ArtifactEntity[];
}
