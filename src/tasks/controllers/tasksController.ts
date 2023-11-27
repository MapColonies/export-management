import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@opentelemetry/api';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { isNumber, isString } from 'lodash';
import { BadRequestError } from '@map-colonies/error-types';
import { SERVICES } from '../../common/constants';
import { WebhookParams } from '../../exportManager/exportManagerRaster';
import { ITaskResponse } from '../interfaces';
import { CreateExportTaskExtendedRequest, TasksManager } from '../models/tasksManager';
import { ExportJobParameters, GetJobByExportIdRequest } from '../../clients/jobManager/interfaces';

type CreateTaskHandler = RequestHandler<undefined, ITaskResponse<ExportJobParameters>, CreateExportTaskExtendedRequest>;
type GetTaskByIdHandler = RequestHandler<GetJobByExportIdRequest, ITaskResponse<ExportJobParameters>, undefined>;
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
      const jobCreated = await this.taskManager.createExportTask(req.body);
      return res.status(httpStatus.CREATED).json(jobCreated);
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

  public getTaskById: GetTaskByIdHandler = async (req, res, next) => {
    try {
      let id = req.params.id;
      if (isString(req.params.id)) {
        id = Number(req.params.id);
      }
      if (!isNumber(id)) {
        throw new BadRequestError(`id should be a number`);
      }
      const job = await this.taskManager.getTaskById(id);
      return res.status(httpStatus.OK).json(job);
    } catch (error) {
      next(error);
    }
  };
}
