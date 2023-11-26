import { inject, singleton } from 'tsyringe';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { CreatePackageParams } from '../tasks/models/tasksManager';
import { WebhookParams } from '../exportManager/exportManagerRaster';
import { OperationStatus } from './jobManager/enums';

export interface CreateExportJobTriggerResponse {
  jobId: string;
  taskIds: string[];
  status: OperationStatus;
  isDuplicated: boolean;
}

export interface ITaskStatusResponse {
  percentage: number | undefined;
  status: OperationStatus;
}

@singleton()
export class ExporterTriggerClient extends HttpClient {
  public constructor(@inject(SERVICES.LOGGER) logger: Logger, @inject(SERVICES.CONFIG) private readonly config: IConfig) {
    super(
      logger,
      config.get<string>('externalClients.exporterTrigger.url'),
      'ExporterTrigger',
      config.get<IHttpRetryConfig>('externalClients.httpRetry'),
      config.get<boolean>('externalClients.disableHttpClientLogs')
    );
  }

  public async createExportTask(params: CreatePackageParams): Promise<CreateExportJobTriggerResponse | WebhookParams> {
    const result = await this.post<CreateExportJobTriggerResponse | WebhookParams>('/create/roi', params);
    return result;
  }

  public async getTaskStatusByJobId(jobId: string): Promise<ITaskStatusResponse> {
    const result = await this.get<ITaskStatusResponse>(`/taskStatus/${jobId}`);
    result.percentage = result.percentage ?? 0;
    return result;
  }
}
