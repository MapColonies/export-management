import { Artifact } from '@map-colonies/export-interfaces';
import { ITaskEntity } from './tasks';

export interface IArtifactEntity extends Artifact {
  /** The auto-generated ID of the artifact. */
  id: number;
  /**The tasks relation of the tasks. */
  tasks: ITaskEntity[];
}
