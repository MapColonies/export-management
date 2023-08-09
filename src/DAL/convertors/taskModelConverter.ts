import { singleton } from 'tsyringe';
import { TaskEntity } from '../entity/task';
import { CreateExportTaskRequest, TaskEvent, TaskParameters } from '@map-colonies/export-interfaces';
import { ITaskCreate } from '../../tasks/interfaces';
import { TaskModel } from '../models/task';
import { CreateExportTaskExtendedRequest } from '../../tasks/models/tasksManager';

@singleton()
export class TaskModelConvertor {
  public constructor() {}

  public createModelToEntity(model: CreateExportTaskExtendedRequest): TaskModel {
    return TaskEntity.create({
      jobId: "de0dab85-6bc5-4b9f-9a64-9e61627d82d9",
      catalogRecordID: model.catalogRecordID,
      clientName: 'clientName',
      artifactCRS: model.artifactCRS,
      domain: model.domain,
      description: model.description,
      keywords: model.keywords,
      webhook: model.webhook,
    });
  }
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
