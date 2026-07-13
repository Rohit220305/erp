import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;
}
