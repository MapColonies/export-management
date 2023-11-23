import { snakeCase } from 'lodash';
import { TaskStatus } from '@map-colonies/export-interfaces';

export const generateUniqueId = (): number => {
  const date = new Date();
  const utcDateTime = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getMilliseconds()
  );
  return utcDateTime;
};

export const convertToUnifiedTaskStatus = (taskStatus: string): TaskStatus => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return snakeCase(taskStatus).toUpperCase() as TaskStatus;
};
