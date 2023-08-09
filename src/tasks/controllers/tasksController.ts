import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@opentelemetry/api';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { WebhookParams } from '../../exportManager/exportManagerRaster';
import { ExportJobParameters } from '../../clients/jobManagerClient';
import { ITaskResponse, TaskParameters } from '../interfaces';
import { CreateExportTaskExtendedRequest, TasksManager } from '../models/tasksManager';
import { CreateExportTaskResponse } from '@map-colonies/export-interfaces';
import { TaskModel } from '../../DAL/models/task';

type CreateTaskHandler = RequestHandler<undefined, ITaskResponse<ExportJobParameters>, CreateExportTaskExtendedRequest>;
type GetTaskByIdHandler = RequestHandler<{taskId: number}, TaskModel | undefined , undefined, undefined>;
type GetTasks = RequestHandler<undefined, TaskModel[] , undefined, {limit: number}>;
type SendWebhookHandler = RequestHandler<undefined, undefined, WebhookParams>;

@injectable()
export class TasksController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TasksManager) private readonly taskManager: TasksManager,
    @inject(SERVICES.METER) private readonly meter: Meter
  ) {}

  public createExportTask: CreateTaskHandler = async (req, res, next) => {
    try {
      await this.taskManager.createExportTask(req.body);
      return res.status(httpStatus.CREATED).send();
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

  public getTasks: GetTasks = async (req, res, next) => {
    try {
      const result = await this.taskManager.getTasks(req.query.limit);
      return res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  // public sendWebhook: SendWebhookHandler = async (req, res, next) => {
  //   try {
  //     await this.taskManager.handleWebhookEvent(req.body);
  //     return res.sendStatus(httpStatus.OK);
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
