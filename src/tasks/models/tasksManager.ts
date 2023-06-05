import { Logger } from '@map-colonies/js-logger';
import { Artifact, CreateExportTaskRequest, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { inject, injectable } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { ArtifactRasterType, Domain, EPSGDATA } from '@map-colonies/types';
import { ExporterTriggerClient } from '../../clients/exporterTriggerClient';
import { FeatureCollection } from '@turf/turf';
import { BadRequestError } from '@map-colonies/error-types';
import { ExportManagerRaster, WebhookParams } from '../../exportManager/exportManagerRaster';
import { IExportManager } from '../../exportManager/interfaces';
import { ITask } from '../interfaces';
import { JobManagerClient } from '../../clients/jobManagerClient';

export interface CreateExportTaskExtendedRequest extends CreateExportTaskRequest<TaskParameters> {
  domain: Domain;
  keywords: Record<string, unknown>;
}

export interface CreatePackageParams {
  dbId: string;
  crs?: string;
  priority?: number;
  roi?: FeatureCollection;
  callbackURLs?: string[];
  description?: string;
}

@injectable()
export class TasksManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger, private readonly exportManagerRaster: ExporterTriggerClient, private readonly jobManagerClient: JobManagerClient) {}

  public async createExportTask(req: CreateExportTaskExtendedRequest): Promise<void> {
    const domain = req.domain;
    const exportManagerInstance = this.getExportManagerInstance(domain);
    exportManagerInstance.createExportTask(req);
  }

  public async sendWebhook(params: WebhookParams): Promise<void> {
    console.log(params);
    const artifacts: Artifact[] = [
      { name: params.fileNames.dataName, size: params.fileSize, type: ArtifactRasterType.GPKG, uri: params.links.dataURI },
      { name: params.fileNames.metadataName, type: ArtifactRasterType.METADATA, uri: params.links.metadataURI },
    ];
    const task: ITask<TaskParameters> = {
      id: new Date().getUTCMilliseconds(), // TBD
      catalogRecordID: params.recordCatalogId,
      domain: Domain.RASTER, // TBD
      ROI: params.roi,
      webhook: [{event: TaskEvent.TASK_COMPLETED, uri: 'http://TBD/'}],
      artifactCRS: EPSGDATA[4326].code, // TBD
      description: params.description,
      keywords: {test: 'test'},
      status: params.status,
      artifacts: artifacts,
      createdAt: new Date(),
      finishedAt: new Date(),
      expiredAt: params.expirationTime,
    };
  }

  private getExportManagerInstance(domain: Domain): IExportManager {
    let exportManagerInstance: IExportManager;
    const unsupportedDomainMessage = `Unsupported domain requested: "${domain}" - currently only "${Domain.RASTER}" domain is supported`;

    switch (domain) {
      case Domain.RASTER:
        exportManagerInstance = new ExportManagerRaster(this.logger, this.exportManagerRaster, this.jobManagerClient);
        break;
      case Domain.DEM:
        throw new BadRequestError(unsupportedDomainMessage);
      case Domain._3D:
        throw new BadRequestError(unsupportedDomainMessage);
      default:
        throw new BadRequestError(unsupportedDomainMessage);
    }

    return exportManagerInstance;
  }
}
