import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { MaterialRequestStatus } from '../enum/material-request.enum';

@Entity('material_request')
export class MaterialRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int', nullable: true })
  productionBatchId: number | null;

  @Column({ type: 'int', nullable: true })
  productionOrderId: number | null;

  @Column({ type: 'int', nullable: true })
  plantId: number | null;

  @Column({ type: 'int', nullable: true })
  warehouseId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  warehouseName: string | null;

  @Column({ type: 'tinyint', default: 0 })
  isGlobal: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string | null;

  @Column({
    type: 'enum',
    enum: MaterialRequestStatus,
    default: MaterialRequestStatus.Pending,
  })
  status: MaterialRequestStatus;

  @Column({ type: 'int' })
  requestedBy: number;

  @Column({ type: 'datetime' })
  requestedDate: Date;

  @Column({ type: 'datetime', nullable: true })
  deliveredDate: Date | null;

  @Column({ type: 'tinyint', default: 0 })
  sysRecDeleted: boolean;
}
