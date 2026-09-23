import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ProductionBatchTimelineAction } from '../enum/production-batch.enum';

@Entity('production_batch_process_timeline')
export class ProductionBatchProcessTimelineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int' })
  productionBatchId: number;

  @Column({ type: 'int' })
  productionBatchProcessId: number;

  @Column({ type: 'enum', enum: ProductionBatchTimelineAction })
  action: ProductionBatchTimelineAction;

  @Column({ type: 'int', nullable: true })
  actionBy: number | null;

  @Column({ type: 'datetime' })
  actionAt: Date;
}
