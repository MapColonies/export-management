import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { TaskEvent } from '@map-colonies/export-interfaces';
import { TaskEntity } from './task';

@Entity('webhook')
export class WebhookEntity {
  @PrimaryGeneratedColumn()
  public id: number;
  
  @Column('varchar', { nullable: false })
  public url: string;

  @Column({type: 'enum', enum: TaskEvent, nullable: false })
  public event: TaskEvent;

  @ManyToMany(
    () => TaskEntity
  )
  tasks: TaskEntity[]

  public constructor();
  public constructor(init: Partial<WebhookEntity>);
  public constructor(...args: [] | [Partial<WebhookEntity>]) {
    if (args.length === 1) {
      Object.assign(this, args[0]);
    }
  }
}
