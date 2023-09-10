import { AtrifactType } from '@map-colonies/export-interfaces';
import { IArtifact } from './artifact';

export interface IArtifactType {
  /** The auto-generated ID of the artifact type. */
  id?: number;
  /** The artifact type. */
  type: AtrifactType;
  /** The artifacts that belongs to the type. */
  artifacts?: IArtifact[];
}
