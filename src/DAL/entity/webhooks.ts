import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { TaskEvent } from '@map-colonies/export-interfaces';
import { IWebhookEntity } from '../models/webhooks';
import { ITaskEntity } from '../models/tasks';
import { TaskEntity } from './tasks';

@Entity('Webhooks')
export class WebhookEntity implements IWebhookEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar', { nullable: false })
  public url: string;

  @Column({ type: 'enum', enum: TaskEvent, array: true, nullable: false })
  public events: TaskEvent[];

  @ManyToOne(() => TaskEntity, (task) => task.webhooks)
  @JoinColumn({ name: 'task_id' })
  public task: ITaskEntity;
}
