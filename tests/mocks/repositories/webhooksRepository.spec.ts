import { WebhooksRepository } from '../../../src/DAL/repositories/webhooksRepository';

const upsertWebhookMock = jest.fn();

const webhooksRepositoryMock = {
  upsertWebhook: upsertWebhookMock,
} as unknown as WebhooksRepository;

export { upsertWebhookMock, webhooksRepositoryMock };
