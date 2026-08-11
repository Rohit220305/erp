import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Status } from 'src/package/common/enums/status.enum';

@Entity({
  name: 'activity_master',
})
export class ActivityMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activityCode', length: 50, unique: true })
  activityCode: string;

  @Column({ length: 50 })
  module: string;

  @Column({ length: 50 })
  activity: string;

  @Column({ name: 'messageTemplate', length: 500 })
  messageTemplate: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @Column({
    type: 'tinyint',
    default: 0,
    name: 'sysRecDeleted',
  })
  sysRecDeleted: boolean;
}
