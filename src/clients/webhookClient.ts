import { inject, singleton } from 'tsyringe';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Logger } from '@map-colonies/js-logger';
import { SERVICES } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { WebhookEvent } from '../tasks/interfaces';
import { ExportJobParameters } from './jobManager/interfaces';

@singleton()
export class WebhookClient extends HttpClient {
  public constructor(@inject(SERVICES.LOGGER) logger: Logger, @inject(SERVICES.CONFIG) private readonly config: IConfig) {
    super(
      logger,
      '',
      'WebhookClient',
      config.get<IHttpRetryConfig>('externalClients.httpRetry'),
      config.get<boolean>('externalClients.disableHttpClientLogs')
    );
  }

  public async send(url: string, data: WebhookEvent<ExportJobParameters>): Promise<void> {
    this.logger.info({ data, msg: `Sending webhook data"`, url });
    await this.post(url, data);
  }
}
