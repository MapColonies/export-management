import { inject, singleton } from 'tsyringe';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { CallbackExportResponse } from '@map-colonies/raster-shared';
import { SERVICES } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { CreateExportRequest } from '../exportManager/exportManagerRaster';
import { OperationStatus } from './jobManager/enums';

export interface CreateExportJobTriggerResponse {
  jobId: string;
  status: OperationStatus;
  isDuplicated?: boolean;
  percentage?: number;
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

  public async createExportTask(params: CreateExportRequest): Promise<CreateExportJobTriggerResponse | CallbackExportResponse> {
    const result = await this.post<CreateExportJobTriggerResponse | CallbackExportResponse>('/export', params);
    return result;
  }
}
