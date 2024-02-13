import { IArtifactTypeEntity } from './artifactType';
import { ITaskEntity } from './task';

export interface IArtifactEntity {
  /** The auto-generated ID of the artifact. */
  id: number;
  /** The artifact type relation of the artifact. */
  type: IArtifactTypeEntity;
  /** The name of the artifact. */
  name: string;
  /**The tasks relation of the tasks. */
  tasks?: ITaskEntity[];
  /** Url of the artifact. */
  url: string;
  /** The size of the artifact data. */
  size?: number;
}
