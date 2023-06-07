import { inject, singleton } from 'tsyringe';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { CreatePackageParams } from '../tasks/models/tasksManager';
import { CreateExportJobResponse, WebhookParams } from '../exportManager/exportManagerRaster';

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

  // TODO change unknown to return type
  public async createExportTask(params: CreatePackageParams): Promise<CreateExportJobResponse | WebhookParams> {
    // this.logger.info({ data, msg: `Sending callback request to URL: "${callbackUrl}"` });
    const result = await this.post<CreateExportJobResponse | WebhookParams>('/create/roi', params);
    return result;
  }
}
