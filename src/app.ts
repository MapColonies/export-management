import { Application } from 'express';
import { registerExternalValues, RegisterOptions } from './containerConfig';
import { ServerBuilder } from './serverBuilder';
import { DependencyContainer } from 'tsyringe';

async function getApp(registerOptions?: RegisterOptions): Promise<[Application, DependencyContainer] > {
  const container = await registerExternalValues(registerOptions);
  console.log("###########################################################")
  const app = container.resolve(ServerBuilder).build();
  return [app, container];
}

export { getApp };
