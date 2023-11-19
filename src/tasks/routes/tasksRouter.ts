import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { TasksController } from '../controllers/tasksController';

const tasksRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(TasksController);

  router.post('/', controller.createExportTask);
  router.get('/:id', controller.getTaskById);
  router.post('/webhook', controller.sendWebhook);

  return router;
};

export const TASKS_ROUTER_SYMBOL = Symbol('tasksRouterFactory');

export { tasksRouterFactory };
