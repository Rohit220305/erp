import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'activity_logs',
})
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'actorUserId' })
  actorUserId: number;

  @Column({ name: 'impersonatorId', nullable: true })
  impersonatorId: number;

  @Column({ length: 50 })
  action: string;

  @Column({ length: 50 })
  module: string;

  @Column({ name: 'entityId', nullable: true })
  entityId: number;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'json', nullable: true })
  oldValue: any;

  @Column({ type: 'json', nullable: true })
  newValue: any;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
