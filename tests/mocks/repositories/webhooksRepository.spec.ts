import { WebhooksRepository } from '../../../src/DAL/repositories/webhooksRepository';

const upsertWebhooksMock = jest.fn();

const webhooksRepositoryMock = {
  upsertWebhooks: upsertWebhooksMock,
} as unknown as WebhooksRepository;

export { upsertWebhooksMock, webhooksRepositoryMock };
