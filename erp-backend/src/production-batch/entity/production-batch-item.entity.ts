import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductionBatchProcessEntity } from './production-batch-process.entity';
import { MaterialType } from '../enum/production-batch.enum';

export const numericColumnTransformer = {
  to: (data: number): number => data,
  from: (data: string): number => (data ? parseFloat(data) : 0),
};

@Entity('production_batch_items')
export class ProductionBatchItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

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
  requiredQty: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    default: 0,
    transformer: numericColumnTransformer,
  })
  consumedQty: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    default: 0,
    transformer: numericColumnTransformer,
  })
  producedQty: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    default: 0,
    transformer: numericColumnTransformer,
  })
  availableStock: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    transformer: numericColumnTransformer,
  })
  shortage: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    transformer: numericColumnTransformer,
  })
  requestQty: number;

  @ManyToOne(() => ProductionBatchProcessEntity)
  @JoinColumn({ name: 'productionBatchProcessId' })
  productionBatchProcess: ProductionBatchProcessEntity;
}
