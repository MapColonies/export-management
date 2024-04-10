import { FactoryFunction } from 'tsyringe';
import { DataSource } from 'typeorm';
import { ArtifactEntity, TaskEntity, WebhookEntity } from '../entity';
import { Webhook } from '@map-colonies/export-interfaces';
import { IWebhookEntity } from '../models/webhooks';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWebhooksRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(WebhookEntity).extend({
    async addWebhooks(webhooks: Webhook[], task: TaskEntity): Promise<void> {
      webhooks.map(async webhook => {
        const exists = await this.exist({where: {url: webhook.url}})
        if (exists) {
            return;
        }
        const newWebhook = this.create({
            task,
            url: webhook.url,
            events: webhook.events
        })
        newWebhook.url = webhook.url;
        newWebhook.events = webhook.events;
        newWebhook
        const res = await this.save(newWebhook)
        return res;
      })
    },
  });
};

export type WebhooksRepository = ReturnType<typeof createWebhooksRepository>;

export const webhooksRepositoryFactory: FactoryFunction<WebhooksRepository> = (depContainer) => {
  return createWebhooksRepository(depContainer.resolve<DataSource>(DataSource));
};

export const WEBHOOKS_REPOSITORY_SYMBOL = Symbol('WEBHOOKS_REPOSITORY');
