import { CreateExportTaskRequest, TaskParameters } from '@map-colonies/export-interfaces';
import * as supertest from 'supertest';

export class TasksRequestSender {
  public constructor(private readonly app: Express.Application) {}

  public async createTask(req: CreateExportTaskRequest<TaskParameters>): Promise<supertest.Response> {
    return supertest.agent(this.app).post('/export-tasks').set('Content-Type', 'application/json').send(req);
  }

  public async getLatestTasksByLimit(limit: number): Promise<supertest.Response> {
    return supertest.agent(this.app).get('/export-tasks').query({ limit }).set('Content-Type', 'application/json');
  }

  public async getTaskById(id: number): Promise<supertest.Response> {
    return supertest.agent(this.app).get(`/export-tasks/${id}`).set('Content-Type', 'application/json');
  }
}
