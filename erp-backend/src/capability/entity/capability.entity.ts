import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';

@Entity('capabilities')
export class CapabilityEntity extends AbstractBaseEntity {
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
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}
