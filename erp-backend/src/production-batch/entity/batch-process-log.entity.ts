import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LogType } from '../enum/production-batch.enum';

@Entity('batch_process_log')
export class BatchProcessLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  logCode: string | null;

  @Column({ type: 'int' })
  productionOrderId: number;

  @Column({ type: 'int' })
  productionBatchId: number;

  @Column({ type: 'int' })
  productionBatchProcessId: number;

  @Column({
    type: 'enum',
    enum: LogType,
  })
  logType: LogType;

  @Column({ type: 'datetime' })
  logDate: Date;

  @Column({ type: 'int', nullable: true })
  addedBy: number | null;

  @Column({ type: 'datetime', nullable: true })
  addedDate: Date;
}
