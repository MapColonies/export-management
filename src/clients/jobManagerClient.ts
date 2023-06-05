import { inject, injectable } from 'tsyringe';
import config from 'config';
import { Logger } from '@map-colonies/js-logger';
import booleanEqual from '@turf/boolean-equal';
import bboxPolygon from '@turf/bbox-polygon';
import { SERVICES } from '../common/constants';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';

@injectable()
export class JobManagerClient extends HttpClient {
  private readonly exportJobType: string;

  public constructor(@inject(SERVICES.LOGGER) protected readonly logger: Logger) {
    super(
      logger,
      config.get<string>('externalClients.jobManager.url'),
      'JobbManager',
      config.get<IHttpRetryConfig>('externalClients.httpRetry'),
      config.get<boolean>('externalClients.disableHttpClientLogs')
    );
    this.exportJobType = config.get<string>('externalClients.jobManager.exportJobType');
  }

  public async updateJobParameters(jobId: string, parameters: Record<string, unknown>): Promise<void> {
    this.logger.info({ msg: `update job parameters by jobId: ${jobId}`, params: parameters });
    await this.put(`/jobs/${jobId}`, { parameters });
  }

  // TODO: handle return type
  public async getJobByType(jobId: string): Promise<unknown> {
    this.logger.info({ msg: `get job by jobId: ${jobId} request - jobType: ${this.exportJobType}` });
    const result = await this.get(`/jobs/${jobId}`);
    return result;
  }
}
