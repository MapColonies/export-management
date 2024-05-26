import { TaskRepository } from '../../../src/DAL/repositories/taskRepository';

const createTaskMock = jest.fn();
const createMock = jest.fn();
const saveTaskMock = jest.fn();
const getTaskByIdMock = jest.fn();
const getLatestTasksByLimitMock = jest.fn();
const getCustomerTaskByJobIdMock = jest.fn();

const taskRepositoryMock = {
  createTask: createTaskMock,
  create: createMock,
  saveTask: saveTaskMock,
  getTaskById: getTaskByIdMock,
  getLatestTasksByLimit: getLatestTasksByLimitMock,
  getCustomerTaskByJobId: getCustomerTaskByJobIdMock,
} as unknown as TaskRepository;

export { createTaskMock, createMock, saveTaskMock, getTaskByIdMock, getLatestTasksByLimitMock, getCustomerTaskByJobIdMock, taskRepositoryMock };
