import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@opentelemetry/api';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { CreateExportTaskRequest, TaskParameters } from '@map-colonies/export-interfaces';
import { SERVICES } from '../../common/constants';
import { TaskResponse, TasksManager } from '../models/tasksManager';
import { FindTaskById } from '../../DAL/repositories/taskRepository';

type CreateTaskHandler = RequestHandler<undefined, TaskResponse, CreateExportTaskRequest<TaskParameters>>;
type GetTaskByIdHandler = RequestHandler<FindTaskById, TaskResponse | undefined, undefined, undefined>;
type GetLatestTasksByLimitHandler = RequestHandler<undefined, TaskResponse[], undefined, { limit: number }>;

@injectable()
export class TasksController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TasksManager) private readonly taskManager: TasksManager,
    @inject(SERVICES.METER) private readonly meter: Meter
  ) {}

  public createTask: CreateTaskHandler = async (req, res, next) => {
    try {
      const jwtPayloadSub = req.get('jwt-payload-sub'); // header name should match the header that has been defined on default.conf (nginx conf file).
      const entity = await this.taskManager.createTask(req.body, jwtPayloadSub);
      return res.status(httpStatus.CREATED).json(entity);
    } catch (error) {
      next(error);
    }
  };

  public getTaskById: GetTaskByIdHandler = async (req, res, next) => {
    try {
      const id = req.params.id;
      const result = await this.taskManager.getTaskById(id);
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getLatestTasksByLimit: GetLatestTasksByLimitHandler = async (req, res, next) => {
    try {
      const result = await this.taskManager.getLatestTasksByLimit(req.query.limit);
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
