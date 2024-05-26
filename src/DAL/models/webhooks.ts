import { Webhook } from '@map-colonies/export-interfaces';
import { ITaskEntity } from './tasks';

export interface IWebhookEntity extends Webhook {
  /** The auto-generated ID of the webhook. */
  id: number;
  /** The tasks relation of the tasks. */
  task: ITaskEntity;
}
