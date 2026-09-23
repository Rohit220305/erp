import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ProductionBatchProcessStatus } from '../enum/production-batch.enum';

@Entity('production_batch_process')
export class ProductionBatchProcessEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int' })
  productionBatchId: number;

  @Column({ type: 'int' })
  processTemplateMappingId: number;

  @Column({ type: 'int' })
  processId: number;

  @Column({ type: 'int' })
  sequenceNumber: number;

  @Column({
    type: 'enum',
    enum: ProductionBatchProcessStatus,
    default: ProductionBatchProcessStatus.YetToStart,
  })
  status: ProductionBatchProcessStatus;

  @Column({ type: 'datetime', nullable: true })
  startTime: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date | null;

  @Column({ type: 'int', nullable: true })
  activeDurationSeconds: number | null;
}
