import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('capabilities')
export class CapabilityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'capabilityCode',
    length: 100,
    unique: true,
  })
  capabilityCode: string;

  @Column({
    name: 'capabilityName',
    length: 200,
  })
  capabilityName: string;

  @Column({
    name: 'moduleName',
    length: 100,
  })
  moduleName: string;

  @Column({
    name: 'actionName',
    length: 100,
  })
  actionName: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: ['Active', 'InActive'],
    default: 'Active',
  })
  status: string;

  @Column({
    nullable: true,
  })
  addedBy: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  addedDate: Date;

  @Column({
    nullable: true,
  })
  updatedBy: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updatedDate: Date;
}
