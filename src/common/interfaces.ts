import { Artifact, TaskEvent } from '@map-colonies/export-interfaces';
import { FeatureCollection } from '@turf/turf';

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface OpenApiConfig {
  filePath: string;
  basePath: string;
  jsonPath: string;
  uiPath: string;
}
