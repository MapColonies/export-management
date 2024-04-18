import { Artifact, TaskStatus, Webhook } from "@map-colonies/export-interfaces"
import { Domain, EpsgCode } from "@map-colonies/types"

export interface ITaskResponse {
    id: number;
    catalogRecordID: string;
    domain: Domain;
    artifactCRS: EpsgCode;
    description: string;
    keywords: Record<string, unknown>;
    webhooks: Webhook[];
    estimatedSize: Date;
    estimatedTime: Date;
    status: TaskStatus;
    errorReason: string;
    progress: number;
    artifacts: Artifact[];
    createdAt: Date;
    expiredAt: Date;
    finishedAt: Date;
}
