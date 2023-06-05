import { CreateExportTaskRequest } from '@map-colonies/export-interfaces';
import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@opentelemetry/api';
import { BoundCounter } from '@opentelemetry/api-metrics';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { WebhookParams } from '../../exportManager/exportManagerRaster';
import { TaskParameters } from '../interfaces';
import { CreateExportTaskExtendedRequest, TasksManager } from '../models/tasksManager';

//type GetTaskHandler = RequestHandler<undefined, ITasksModel>;
type CreateTaskHandler = RequestHandler<undefined, undefined, CreateExportTaskExtendedRequest>;
type SendWebhookHandler = RequestHandler<undefined, undefined, WebhookParams>;

@injectable()
export class TasksController {
  private readonly createdResourceCounter: BoundCounter;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TasksManager) private readonly taskManager: TasksManager,
    @inject(SERVICES.METER) private readonly meter: Meter
  ) {
    this.createdResourceCounter = meter.createCounter('created_resource');
  }

  public createExportTask: CreateTaskHandler = async (req, res, next) => {
    try {
      await this.taskManager.createExportTask(req.body);
      return res.sendStatus(httpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };
  
  public sendWebhook: SendWebhookHandler = async (req, res, next) => {
    try {
      await this.taskManager.sendWebhook(req.body);
      return res.sendStatus(httpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}
