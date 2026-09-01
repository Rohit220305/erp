import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { AbstractBaseEntity } from '../../package/entities/base.entity';
import { ProductionOrderStatus } from '../enum/production-order.enum';

export const numericColumnTransformer = {
  to: (data: number): number => data,
  from: (data: string): number => (data ? parseFloat(data) : 0),
};

@Entity('production_order')
@Unique(['productionOrderCode', 'companyId'])
export class ProductionOrderEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  productionOrderCode: string;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int' })
  bomId: number;

  @Column({ type: 'int' })
  itemId: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    transformer: numericColumnTransformer,
  })
  productionQuantity: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    transformer: numericColumnTransformer,
  })
  pendingQuantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceNumber: string | null;

  @Column({ type: 'datetime' })
  productionDate: Date;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ type: 'int', nullable: true })
  plantId: number | null;

  @Column({ type: 'int', nullable: true })
  customerId: number | null;

  @Column({
    type: 'enum',
    enum: ProductionOrderStatus,
    default: ProductionOrderStatus.Draft,
  })
  status: ProductionOrderStatus;
}
