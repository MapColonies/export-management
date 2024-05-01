/* eslint-disable @typescript-eslint/naming-convention */
import { Logger } from '@map-colonies/js-logger';
import config from 'config';
import {
  CreateExportTaskRequest,
  CreateExportTaskResponse,
  GetEstimationsResponse,
  IExportManager,
  TaskParameters,
  TaskStatus,
} from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { Domain } from '@map-colonies/types';
import { BadRequestError, NotFoundError } from '@map-colonies/error-types';
import { FeatureCollection } from '@turf/turf';
import { SERVICES } from '../../common/constants';
import { ExportManagerRaster } from '../../exportManager/exportManagerRaster';
import { TASK_REPOSITORY_SYMBOL, TaskRepository } from '../../DAL/repositories/taskRepository';
import { ITaskEntity } from '../../DAL/models/tasks';
import { WEBHOOKS_REPOSITORY_SYMBOL, WebhooksRepository } from '../../DAL/repositories/webhooksRepository';
import { omit } from '../../common/utils';
import { getExportManagerInstance } from '../../exportManager/utils';

export type TaskResponse = Omit<ITaskEntity, 'jobId' | 'taskGeometries' | 'customerName'>;

@injectable()
export class TasksManager {
  private readonly maxTasksNumber: number;

  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TASK_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository,
    @inject(WEBHOOKS_REPOSITORY_SYMBOL) private readonly webhooksRepository: WebhooksRepository
  ) {
    this.maxTasksNumber = config.get<number>('maxTasksNumber');
  }

  public async createTask(req: CreateExportTaskRequest<TaskParameters>, jwtPayloadSub?: string): Promise<TaskResponse> {
    try {
      const domain = req.domain;
      const customerName = jwtPayloadSub ?? 'unknown';
      const catalogRecordID = req.catalogRecordID;
      const exportManagerInstance = getExportManagerInstance(domain);

      // TODO: Call Domain SDK
      this.logger.info({ msg: `create export task request for ${domain} domain`, catalogRecordID, domain });
      const domainResponse = await exportManagerInstance.createExportTask(req);
      const task = await this.upsertTask(exportManagerInstance, req, domainResponse, customerName);
      console.log('#$#$#$#$#$#$#$#$#$#$#$#$#$#$$');
      const taskResponse: TaskResponse = omit(task, ['jobId', 'taskGeometries', 'customerName']);
      return taskResponse;
    } catch (error) {
      const errMessage = `failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }

  public async getTaskById(id: number): Promise<TaskResponse> {
    try {
      this.logger.info({ msg: `get task by id: ${id}`, id });

      const task = await this.taskRepository.getTaskById({ id });
      if (!task) {
        throw new NotFoundError(`task id: ${id} is not found`);
      }

      const taskResponse: TaskResponse = omit(task, ['jobId', 'taskGeometries', 'customerName']);
      return taskResponse;
    } catch (error) {
      const errMessage = `failed to get task id ${id}: ${(error as Error).message}`;
      this.logger.error({ err: error, id, msg: errMessage });
      throw error;
    }
  }

  public async getLatestTasksByLimit(limit: number): Promise<TaskResponse[]> {
    try {
      this.logger.info({ msg: `get task by limit ${limit}`, limit });
      if (limit > this.maxTasksNumber) {
        throw new BadRequestError(`requested limit ${limit} is higher than the maximum possible limit tasks number ${this.maxTasksNumber}`);
      }
      const tasksResponse: TaskResponse[] = [];
      const tasks = await this.taskRepository.getLatestTasksByLimit(limit);
      tasks.forEach((task) => {
        const taskResponse: TaskResponse = omit(task, ['jobId', 'taskGeometries', 'customerName']);
        tasksResponse.push(taskResponse);
      });
      return tasksResponse;
    } catch (error) {
      const errMessage = `failed to get tasks by limit: ${(error as Error).message}`;
      this.logger.error({ err: error, limit: limit, msg: errMessage });
      throw error;
    }
  }

  private async upsertTask(
    exportManagerInstance: IExportManager,
    req: CreateExportTaskRequest<TaskParameters>,
    domainResponse: CreateExportTaskResponse,
    customerName: string
  ): Promise<ITaskEntity> {
    const jobId = domainResponse.jobId;
    if (!domainResponse.status) {
      const res = await this.createNewTask(exportManagerInstance, req, domainResponse, customerName);
      this.logger.info({
        msg: `created new task, id: ${res.id}`,
        jobId,
        customerName,
      });
      return res;
    }

    this.logger.debug({
      msg: `querying for similar '${domainResponse.status}' task by job id ${jobId} and customer name: ${customerName}`,
      jobId,
      customerName,
    });
    const task = await this.taskRepository.getCustomerTaskByJobId(jobId, customerName);

    if (!task) {
      const errMessage = `task with job id ${jobId} and customer name: ${customerName} was not found`;
      this.logger.error({
        msg: errMessage,
        jobId,
        customerName,
      });
      throw new NotFoundError(errMessage);
    }

    this.logger.info({
      msg: `found similar '${task.status}' task id ${task.id} with job id ${jobId} and customer name: ${customerName}`,
      taskId: task.id,
      jobId,
      customerName,
    });

    if (task.status === TaskStatus.COMPLETED) {
      this.logger.debug({
        msg: `response with completed task, task id: ${task.id}`,
        taskId: task.id,
        jobId,
        customerName,
      });

      task.artifacts = domainResponse.artifacts;
    } else if (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS) {
      this.logger.debug({
        msg: `updating webhooks for task id: ${task.id}`,
        taskId: task.id,
        webhooks: req.webhooks,
      });
      console.log('#######################################');
      await this.webhooksRepository.upsertWebhooks(req.webhooks, task.id);
      console.log('$%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    }
    return task;
  }

  private async getEstimations(
    exportManagerInstance: IExportManager,
    recordCatalogId: string,
    ROI: FeatureCollection
  ): Promise<GetEstimationsResponse> {
    const estimations = await exportManagerInstance.getEstimations(recordCatalogId, ROI);
    this.logger.debug({
      msg: `received estimations from domain: ${JSON.stringify(estimations)}`,
      estimations,
    });

    return estimations;
  }

  private async createNewTask(
    exportManagerInstance: IExportManager,
    req: CreateExportTaskRequest<TaskParameters>,
    exportTaskResponse: CreateExportTaskResponse,
    customerName: string
  ): Promise<ITaskEntity> {
    const estimations = await this.getEstimations(exportManagerInstance, req.catalogRecordID, req.ROI);
    const task = this.taskRepository.create({
      ...req,
      ...exportTaskResponse,
      ...estimations,
      customerName,
    });

    const res = await this.taskRepository.saveTask(task);
    return res;
  }
}
