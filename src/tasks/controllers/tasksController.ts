import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@opentelemetry/api';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { WebhookParams } from '../../exportManager/exportManagerRaster';
import { ExportJobParameters } from '../../clients/jobManagerClient';
import { ITaskResponse } from '../interfaces';
import { CreateExportTaskExtendedRequest, TasksManager } from '../models/tasksManager';
import { BadRequestError } from '@map-colonies/error-types';
// import { ITaskEntity } from '../../DAL/models/task';
// import { FindTaskById } from '../../DAL/repositories/taskRepository';

type CreateTaskHandler = RequestHandler<undefined, ITaskResponse<ExportJobParameters>, CreateExportTaskExtendedRequest>;
type GetTaskByIdHandler = RequestHandler<FindTaskById, /*ITaskEntity |*/ undefined, undefined, undefined>;
type SendWebhookHandler = RequestHandler<undefined, undefined, WebhookParams>;

// eslint-disable-next-line import/exports-last
export interface FindTaskById {
  id: number;
}

@injectable()
export class TasksController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TasksManager) private readonly taskManager: TasksManager,
    @inject(SERVICES.METER) private readonly meter: Meter
  ) {}

  public createExportTask: CreateTaskHandler = async (req, res, next) => {
    try {
      const jobCreated = await this.taskManager.createExportTask(req.body);
      return res.status(httpStatus.CREATED).json(jobCreated);
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

  public sendWebhook: SendWebhookHandler = async (req, res, next) => {
    try {
      await this.taskManager.handleWebhookEvent(req.body);
      return res.sendStatus(httpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}
