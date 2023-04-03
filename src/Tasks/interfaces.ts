import { GeoJSON } from "geojson";
import { FeatureCollection } from "@turf/turf";
import { Artifact3DType, ArtifactDEMType, ArtifactRasterType, Domain } from "../common/enums";
import { TaskEvent, TaskStatus } from "./enums";

export interface ITaskCreate<T> {
    catalogRecordID: string;
    domain: Domain;
    ROI?: FeatureCollection;
    artifactCRS: string;
    description?: string;
    parameters?: T;
    webhook: IWebhook<T>[];
}

export interface ITask<T> extends ITaskCreate<T> {
    id: number;
    estimatedSize?: number;
    footprint?: GeoJSON;
    totalSize?: number;
    status: TaskStatus;
    progress: number;
    atrifacts: Artifact[]
    created_at: Date;
    expired_at?: Date;
    finished_at?: Date;
}

export interface IWebhook<T> {
    event: IWebhookEvent<T>;
    uri: string;
}

export interface IWebhookEvent<T> {
    event: TaskEvent;
    timestamp: Date;
    data: ITask<T>;
}

export interface Artifact {
    id: number;
    name: string;
    type: ArtifactDEMType | ArtifactRasterType | Artifact3DType
    uri: string;
}

export declare type TaskParameters = Record<string, unknown>
