import { ArtifactTypeEntity } from '../entity';
import { ITaskEntity } from './task';

export interface IArtifact {
    /** The auto-generated ID of the artifact. */
    id?: number;
    /** The artifact type relation of the artifact. */
    type: ArtifactTypeEntity;
    /** The name of the artifact. */
    name: string;
    /**The tasks relation of the artifact. */
    tasks?: ITaskEntity[];
    /** Url of the artifact. */
    url: string;
    /** The size of the artifact data. */
    size?: number;
}
