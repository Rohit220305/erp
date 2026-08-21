import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export enum UsageStatus {
  Available = 'Available',
  Inuse = 'Inuse',
  Maintenance = 'Maintenance',
}

@Entity('work_centre_master')
@Unique(['workCentreCode', 'companyId'])
@Unique(['workCentreName', 'companyId'])
export class WorkCentreEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  workCentreName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  workCentreCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'int' })
  categoryId: number;

  @Column({
    type: 'enum',
    enum: UsageStatus,
    default: UsageStatus.Available,
  })
  usageStatus: UsageStatus;

  @Column({ type: 'int' })
  companyId: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}
