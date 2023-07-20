import { singleton } from 'tsyringe';
import { TaskEntity } from '../entity/task';
import { CreateExportTaskRequest, TaskParameters } from '@map-colonies/export-interfaces';
import { ITaskCreate } from '../../tasks/interfaces';

@singleton()
export class TaskModelConvertor {
  public constructor() {}

  public createRequestModelToEntity(createTaskRequest: ITaskCreate<TaskParameters>): TaskEntity {
    const entity = new TaskEntity();
    console.log('before', entity);
    // const tasks = model.tasks?.map((taskModel) => this.taskConvertor.createModelToEntity(taskModel));
    Object.assign(entity, {...createTaskRequest});

    console.log('after', entity);
    return entity;
  }

//   public updateModelToEntity(model: IUpdateJobRequest): JobEntity {
//     const entity = new JobEntity();
//     Object.assign(entity, { ...model, id: model.jobId, jobId: undefined });
//     return entity;
//   }

//   public entityToModel(entity: JobEntity): IGetJobResponse {
//     const tasks = entity.tasks?.map((task) => this.taskConvertor.entityToModel(task));
//     const model = { ...entity, created: entity.creationTime, updated: entity.updateTime, tasks: tasks } as { creationTime?: Date; updateTime?: Date };
//     delete model.creationTime;
//     delete model.updateTime;
//     return model as IGetJobResponse;
//   }
}
