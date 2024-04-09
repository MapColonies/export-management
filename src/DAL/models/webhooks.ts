import { ITaskEntity } from './tasks';
import { Webhook } from '@map-colonies/export-interfaces';

export interface IWebhookEntity extends Webhook {
  /** The auto-generated ID of the webhook. */
  id: number;
  /** The tasks relation of the tasks. */
  task: ITaskEntity;
}
