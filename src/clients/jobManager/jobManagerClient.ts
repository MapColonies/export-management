import { inject, injectable } from 'tsyringe';
import config from 'config';
import { Logger } from '@map-colonies/js-logger';
import { NotFoundError } from '@map-colonies/error-types';
import { HttpClient, IHttpRetryConfig } from '@map-colonies/mc-utils';
import { SERVICES } from '../../common/constants';
import { ExportJobResponse, FindJobsResponse, IGetJobResponse } from './interfaces';

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

  public async getJobByExportId(id: number): Promise<IGetJobResponse> {
    this.logger.info({ msg: `get job by export id request`, id });
    const result: FindJobsResponse = await this.get(`/jobs/parameters?id=${id}`);
    if (result.length > 0) {
      return result[0];
    }
    const msg = `Export task id: ${id} is not found`;
    this.logger.info({ msg: msg, id });
    throw new NotFoundError(msg);
  }
}
