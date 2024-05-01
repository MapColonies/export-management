import { BadRequestError } from '@map-colonies/error-types';
import { IExportManager } from '@map-colonies/export-interfaces';
import { Domain } from '@map-colonies/types';
import { ExportManagerRaster } from './exportManagerRaster';

export const getExportManagerInstance = (domain: Domain): IExportManager => {
  let exportManagerInstance: IExportManager;
  const unsupportedDomainErrorMsg = `unsupported domain requested: "${domain}" - currently only "${Domain.RASTER}" domain is supported`;
  try {
    switch (domain) {
      case Domain.RASTER:
        exportManagerInstance = new ExportManagerRaster();
        break;
      case Domain.DEM:
        throw new BadRequestError(unsupportedDomainErrorMsg);
      case Domain._3D:
        throw new BadRequestError(unsupportedDomainErrorMsg);
      default:
        throw new BadRequestError(unsupportedDomainErrorMsg);
    }
    return exportManagerInstance;
  } catch (error) {
    const errMessage = `failed to get export manager instance by domain, ${(error as Error).message}`;
    throw error;
  }
};
