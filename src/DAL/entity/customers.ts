import { Entity, Column, PrimaryGeneratedColumn, MultiPolygon, Polygon, ManyToMany, OneToMany, JoinColumn } from 'typeorm';
import { GeometryMetadata } from '@map-colonies/export-interfaces';
import { ITaskGeometriesEntity } from '../models/taskGeometries';
import { TaskEntity } from './tasks';
import { ITaskEntity } from '../models/tasks';
import { ICustomerEntity } from '../models/customers';

@Entity('Customers')
export class CustomersEntity implements ICustomerEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar', { nullable: false })
  public customerName: string;
}
