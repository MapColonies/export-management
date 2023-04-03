import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { ITaskCreate, TaskParameters } from '../interfaces';

const resourceInstance: IAnotherResourceModel = {
  kind: 'avi',
  isAlive: false,
};

export interface IAnotherResourceModel {
  kind: string;
  isAlive: boolean;
}

@injectable()
export class TasksManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}
  public async createTask(taskCreate: ITaskCreate<TaskParameters>): Promise<void> {
    this.logger.info({msg: 'logging'});
    console.log(taskCreate);
  }
}
