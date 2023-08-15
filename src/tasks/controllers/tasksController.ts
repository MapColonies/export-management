import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@opentelemetry/api';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { CreateExportTaskRequest, TaskParameters } from '@map-colonies/export-interfaces';
import { SERVICES } from '../../common/constants';
import { TasksManager } from '../models/tasksManager';
import { ITaskEntity } from '../../DAL/models/task';

type CreateTaskHandler = RequestHandler<undefined, ITaskEntity, CreateExportTaskRequest<TaskParameters>>;
type GetTaskByIdHandler = RequestHandler<{ taskId: number }, ITaskEntity | undefined, undefined, undefined>;
type getLatestTasksByLimitHandler = RequestHandler<undefined, ITaskEntity[], undefined, { limit: number }>;

@injectable()
export class TasksController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TasksManager) private readonly taskManager: TasksManager,
    @inject(SERVICES.METER) private readonly meter: Meter
  ) {}

  public createExportTask: CreateTaskHandler = async (req, res, next) => {
    try {
      const entity = await this.taskManager.createExportTask(req.body);
      return res.status(httpStatus.CREATED).json(entity);
    } catch (error) {
      next(error);
    }
  };

  public getTaskById: GetTaskByIdHandler = async (req, res, next) => {
    try {
      const result = await this.taskManager.getTaskById(req.params.taskId);
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getTasks: getLatestTasksByLimitHandler = async (req, res, next) => {
    try {
      const result = await this.taskManager.getLatestTasksByLimit(req.query.limit);
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}
