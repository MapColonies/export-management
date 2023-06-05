import { TaskEvent } from "@map-colonies/export-interfaces";

export enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABORTED = 'ABORTED',
  PAUSED = 'PAUSED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  CLEANED = 'CLEANED',
  ARCHIVED = 'ARCHIVED',
}

export declare type TaskEventPartial = Extract<TaskEvent, "TASK_STARTED" | "TASK_FAILED" | "TASK_COMPLETED"| "TASK_FAILED" | "TASK_ABORTED">

export declare type OperationStatus = "Completed" | "Failed"; // TBD => remove and use TaskStatus
