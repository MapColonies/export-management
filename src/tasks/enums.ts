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

export enum OperationStatus {
  COMPLETED = 'Completed',
  FAILED = 'Failed'
} // TODO: remove and use full TaskStatus from export-intefaces package
