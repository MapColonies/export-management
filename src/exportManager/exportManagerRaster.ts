import { Logger } from '@map-colonies/js-logger';
import { Artifact, TaskStatus } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import config from 'config';
import { Domain, EPSGDATA } from '@map-colonies/types';
import { FeatureCollection } from '@turf/turf';
import { generateUniqueId } from '../common/utils';
import { SERVICES } from '../common/constants';
import { CreateExportJobTriggerResponse, ExporterTriggerClient } from '../clients/exporterTriggerClient';
import { CreateExportTaskExtendedRequest, CreatePackageParams } from '../tasks/models/tasksManager';
import { OperationStatus } from '../tasks/enums';
import { ExportJobParameters, JobManagerClient } from '../clients/jobManagerClient';
import { ITaskResponse } from '../tasks/interfaces';
import { IExportManager } from '../exportManager/interfaces';
import { TaskRepository } from '../DAL/repositories/taskRepository';
import { ConnectionManager } from '../DAL/connectionManager';
import { TaskModel } from '../DAL/models/task';
import { TaskEntity } from '../DAL/entity/task';

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
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {}

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<void> {
    try {
      this.logger.info({ msg: `Create export task request`, req: req });
      const requestedEPSG = `EPSG:${req.artifactCRS}`;
      const taskModel: TaskModel = {
        artifactCRS: requestedEPSG,
        catalogRecordID: req.catalogRecordID,
        domain: req.domain,
        description: req.description,
        keywords: req.keywords,
        webhook: req.webhook,
        parameters: req.parameters,
        ROI: req.ROI,
        clientName: 'Shlomi',
        createdAt: new Date(),
        expiredAt: new Date(),
        finishedAt: new Date(),
        status: TaskStatus.IN_PROGRESS,
        percentage: 55,
        jobId: '46da4997-f041-481d-9751-ba9436a3d704',
        reason: 'reason',
      }

      this.taskRepository.getRepository(TaskEntity, TaskRepository);

      await this.taskRepository.createTask(taskModel)

      
    } catch (error) {
      const errMessage = `Failed to create export task: ${(error as Error).message}`;
      this.logger.error({ err: error, req: req, msg: errMessage });
      throw error;
    }
  }
}
