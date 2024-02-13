import { AtrifactType } from '../entity';
import { IArtifactEntity } from './artifact';

export interface IArtifactTypeEntity {
  /** The auto-generated ID of the artifact type. */
  id: number;
  /** The artifact type. */
  type: AtrifactType;
  /** The artifacts that belongs to the type. */
  artifacts?: IArtifactEntity[];
}
