export enum TaskEvent {
    TASK_STARTED = 'TASK_STARTED',
    TASK_COMPLETED = 'TASK_COMPLETED',
    TASK_FAILED = 'TASK_FAILED',
    TASK_ABORTED = 'TASK_ABORTED',
    TASK_EXPIRED = 'TASK_EXPIRED',
}

export enum TaskStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ABORTED = 'ABORTED',
    PAUSED = 'PAUSED',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    CLEANED = 'CLEANED',
    ARCHIVED = 'ARCHIVED'
}
