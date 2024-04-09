import { FactoryFunction } from 'tsyringe';
import { DataSource } from 'typeorm';
import { ArtifactEntity } from '../entity';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createArtifactRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(ArtifactEntity).extend({
    async createArtifact(entity: ArtifactEntity): Promise<ArtifactEntity> {
      const res = await this.save(entity);
      return res;
    },
  });
};

export type ArtifactRepository = ReturnType<typeof createArtifactRepository>;

export const artifactRepositoryFactory: FactoryFunction<ArtifactRepository> = (depContainer) => {
  return createArtifactRepository(depContainer.resolve<DataSource>(DataSource));
};

export const ARTIFACT_REPOSITORY_SYMBOL = Symbol('ARTIFACT_REPOSITORY');
