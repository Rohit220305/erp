import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AbstractBaseEntity } from '../../package/entities/base.entity';
import { ProductionBatchStatus, MaterialStatus } from '../enum/production-batch.enum';

export const numericColumnTransformer = {
  to: (data: number): number => data,
  from: (data: string): number => (data ? parseFloat(data) : 0),
};

@Entity('production_batch')
export class ProductionBatchEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int' })
  productionOrderId: number;

  @Column({ type: 'int' })
  bomId: number;

  @Column({ type: 'varchar', length: 255 })
  batchCode: string;

  @Column({ type: 'int', nullable: true })
  itemId: number | null;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    transformer: numericColumnTransformer,
  })
  batchQuantity: number;

  @Column({
    type: 'enum',
    enum: ProductionBatchStatus,
    default: ProductionBatchStatus.Pending,
  })
  status: ProductionBatchStatus;

  @Column({ type: 'tinyint', default: 0 })
  markCompleted: boolean;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    transformer: numericColumnTransformer,
  })
  requestedQuantity: number | null;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    transformer: numericColumnTransformer,
  })
  producedQuantity: number | null;

  @Column({
    type: 'enum',
    enum: MaterialStatus,
    nullable: true,
  })
  materialStatus: MaterialStatus | null;

  @Column({ type: 'int', nullable: true })
  completedBy: number | null;
}
