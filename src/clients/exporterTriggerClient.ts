import { inject, singleton } from 'tsyringe';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { CreatePackageParams } from '../tasks/models/tasksManager';

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
  public async createExportTask(params: CreatePackageParams): Promise<unknown> {
    // this.logger.info({ data, msg: `Sending callback request to URL: "${callbackUrl}"` });
    console.log('request to export-trigger: ', params);
    const result = await this.post('/create/roi', params);
    return result;
  }
}
