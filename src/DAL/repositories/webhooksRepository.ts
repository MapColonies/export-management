import { FactoryFunction } from 'tsyringe';
import { DataSource } from 'typeorm';
import { TaskEvent, Webhook } from '@map-colonies/export-interfaces';
import { WebhookEntity } from '../entity';
import { unionArrays } from '../../common/utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWebhooksRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(WebhookEntity).extend({
    async upsertWebhooks(webhooks: Webhook[], taskId: number): Promise<void> {
      const promises = webhooks.map(async (webhook): Promise<any> => {
        const existsWebhookUrl = await this.findOneBy({ url: webhook.url, task: { id: taskId } });
        if (existsWebhookUrl) {
          const unionWebhookEvents = unionArrays<TaskEvent>(existsWebhookUrl.events, webhook.events);
          await this.update(existsWebhookUrl.id, { events: unionWebhookEvents });
          return;
        }
        else {
        const newWebhook = this.create({
          task: { id: taskId },
          url: webhook.url,
          events: webhook.events,
        });
        newWebhook.url = webhook.url;
        newWebhook.events = webhook.events;
        await this.save(newWebhook);
      }
      });
    },
  });
};

export type WebhooksRepository = ReturnType<typeof createWebhooksRepository>;

export const webhooksRepositoryFactory: FactoryFunction<WebhooksRepository> = (depContainer) => {
  return createWebhooksRepository(depContainer.resolve<DataSource>(DataSource));
};

export const WEBHOOKS_REPOSITORY_SYMBOL = Symbol('WEBHOOKS_REPOSITORY');
