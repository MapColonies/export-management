import { TaskEvent } from '@map-colonies/export-interfaces';
import { ITaskEntity } from './task';

export class IWebhookEntity {
  /** The auto-generated ID of the webhook. */
  public id: number;

  /** The target url of the webhook. */
  public url: string;

  /** The requested task events. */
  public events: TaskEvent[];

  /** The tasks relation of the tasks. */
  public tasks?: ITaskEntity[];
}
