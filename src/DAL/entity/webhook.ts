import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { TaskEvent } from '@map-colonies/export-interfaces';
import { TaskEntity } from './task';

@Entity('webhook')
export class WebhookEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar', { nullable: false })
  public url: string;

  @Column({ type: 'enum', enum: TaskEvent, array: true, nullable: false })
  public events: TaskEvent[];

  @ManyToMany(() => TaskEntity)
  public tasks: TaskEntity[];
}
