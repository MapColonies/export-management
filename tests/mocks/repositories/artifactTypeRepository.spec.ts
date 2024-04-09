import { ArtifactTypeRepository } from '../../../src/DAL/repositories/artifactTypeRepository';

const findOneMock = jest.fn();
const saveMock = jest.fn();

const artifactTypeRepositoryMock = {
  findOne: findOneMock,
  save: saveMock,
} as unknown as ArtifactTypeRepository;

export { findOneMock, saveMock, artifactTypeRepositoryMock };
