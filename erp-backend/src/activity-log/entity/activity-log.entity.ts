import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ActivityMasterEntity } from './activity-master.entity';

@Entity({
  name: 'activity_logs',
})
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activityMasterId', type: 'int' })
  activityMasterId: number;

  @ManyToOne(() => ActivityMasterEntity)
  @JoinColumn({ name: 'activityMasterId' })
  activityMaster: ActivityMasterEntity;

  @Column({ name: 'companyId', type: 'int' })
  companyId: number;

  @Column({ name: 'actorUserId', type: 'int' })
  actorUserId: number;

  @Column({ name: 'impersonatorId', type: 'int', nullable: true })
  impersonatorId: number | null;

  @Column({ name: 'entityType', type: 'varchar', length: 50, nullable: true })
  entityType: string | null;

  @Column({ name: 'entityId', type: 'int', nullable: true })
  entityId: number | null;

  @Column({ name: 'actorName', type: 'varchar', length: 200 })
  actorName: string;

  @Column({ name: 'entityName', type: 'varchar', length: 200, nullable: true })
  entityName: string | null;

  @Column({ name: 'renderedMessage', type: 'varchar', length: 500 })
  renderedMessage: string;

  @Column({ name: 'ipAddress', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'userAgent', type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
