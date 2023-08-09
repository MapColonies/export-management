import { inject, injectable } from 'tsyringe';
import config from 'config';
import { Logger } from '@map-colonies/js-logger';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { Webhook } from '@map-colonies/export-interfaces';
import { SERVICES } from '../common/constants';

// eslint-disable-next-line import/exports-last
export interface ExportJobParameters {
  id: number;
  keywords?: Record<string, unknown>;
  webhook: Webhook[];
}

// eslint-disable-next-line import/exports-last
export interface ExportJobResponse {
  parameters: ExportJobParameters;
  created: string;
  updated: string;
}

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
    this.logger.info({ msg: 'update job parameters by jobId', jobId, parameters });
    await this.put(`/jobs/${jobId}`, { parameters });
  }

  public async getJobById(jobId: string): Promise<ExportJobResponse> {
    this.logger.info({ msg: `get job by jobId request`, jobId, jobType: this.exportJobType });
    const result: ExportJobResponse = await this.get(`/jobs/${jobId}`);
    return result;
  }
}
