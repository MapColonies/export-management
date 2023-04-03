import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@opentelemetry/api';
import { BoundCounter } from '@opentelemetry/api-metrics';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { TaskEvent } from '../enums';
import { ITask, ITaskCreate, TaskParameters } from '../interfaces';

import { TasksManager } from '../models/tasksManager';

//type GetTaskHandler = RequestHandler<undefined, ITasksModel>;
type CreateTaskHandler<T> = RequestHandler<undefined, undefined, ITaskCreate<T>>;

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

  public createTask: CreateTaskHandler<TaskParameters> = async (req, res) => {
    console.log('body: ', req.body);
    this.taskManager.createTask(req.body);
    return res.sendStatus(httpStatus.CREATED);
  };

}
