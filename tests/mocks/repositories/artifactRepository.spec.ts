import { ArtifactRepository } from '../../../src/DAL/repositories/artifactRepository';

const createMock = jest.fn();
const saveMock = jest.fn();

const artifactRepositoryMock = {
  create: createMock,
  save: saveMock,
} as unknown as ArtifactRepository;

export { createMock, saveMock, artifactRepositoryMock };
