import { TaskRepository } from '../../../src/DAL/repositories/taskRepository';

const createTaskMock = jest.fn();
const createMock = jest.fn();
const getTaskByIdMock = jest.fn();
const getLatestTasksByLimitMock = jest.fn();

const taskRepositoryMock = {
  createTask: createTaskMock,
  create: createMock,
  getTaskById: getTaskByIdMock,
  getLatestTasksByLimit: getLatestTasksByLimitMock,
} as unknown as TaskRepository;

export { createTaskMock, createMock, getTaskByIdMock, getLatestTasksByLimitMock, taskRepositoryMock };
