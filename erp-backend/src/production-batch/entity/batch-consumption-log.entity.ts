import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { MaterialType } from '../enum/production-batch.enum';

export const numericColumnTransformer = {
  to: (data: number): number => data,
  from: (data: string): number => (data ? parseFloat(data) : 0),
};

@Entity('batch_consumption_log')
export class BatchConsumptionLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 255 })
  consumptionCode: string;

  @Column({ type: 'int' })
  productionOrderId: number;

  @Column({ type: 'int' })
  productionBatchId: number;

  @Column({ type: 'int' })
  productionBatchProcessId: number;

  @Column({ type: 'int' })
  itemId: number;

  @Column({
    type: 'enum',
    enum: MaterialType,
  })
  materialType: MaterialType;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    transformer: numericColumnTransformer,
  })
  consumedQuantity: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    default: 0,
    transformer: numericColumnTransformer,
  })
  availableStock: number;

  @Column({ type: 'int', nullable: true })
  addedBy: number | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  addedDate: Date;
}
