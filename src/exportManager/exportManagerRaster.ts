import { Logger } from '@map-colonies/js-logger';
import { Artifact, GetEstimationsResponse, TaskGeometry, TaskStatus } from '@map-colonies/export-interfaces';
import { container, inject, injectable } from 'tsyringe';
import config from 'config';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { FeatureCollection, Geometries } from '@turf/turf';
import { generateUniqueId } from '../common/utils';
import { SERVICES } from '../common/constants';
import { CreateExportJobTriggerResponse, ExporterTriggerClient } from '../clients/exporterTriggerClient';
import { CreateExportTaskExtendedRequest, CreatePackageParams } from '../tasks/models/tasksManager';
import { OperationStatus } from '../tasks/enums';
import { ExportJobParameters, JobManagerClient } from '../clients/jobManagerClient';
import { ITaskResponse } from '../tasks/interfaces';
import { IExportManager } from '../exportManager/interfaces';
import { TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL, TaskRepository } from '../DAL/repositories/taskRepository';
import { ConnectionManager } from '../DAL/connectionManager';
import { TaskModel } from '../DAL/models/task';
import { TaskEntity } from '../DAL/entity/task';
import { geo1, geo2 } from './geoMocks';
import { TaskModelConvertor } from '../DAL/convertors/taskModelConverter';

export interface WebhookParams {
  expirationTime: string;
  recordCatalogId: string;
  jobId: string;
  description?: string;
  artifacts: Artifact[];
  roi: FeatureCollection;
  status: OperationStatus;
  errorReason?: string;
}

@injectable()
export class ExportManagerRaster implements IExportManager {
  private readonly taskConvertor: TaskModelConvertor
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(TASK_ENTITY_CUSTOM_REPOSITORY_SYMBOL) private readonly taskRepository: TaskRepository,
  ) {
    this.taskConvertor = container.resolve(TaskModelConvertor);
  }

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<void> {
    try {
      this.logger.info({ msg: `Create export task request`, req: req });
      // TODO: Call Raster SDK here to get geometries & jobId
      const taskGeometries: TaskGeometry[] = [geo1, geo2];
      const entity = {...req, taskGeometries};
      console.log(entity);
      await this.taskRepository.createEntity(entity);
    } catch (error) {
      const errMessage = `Failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }
}
