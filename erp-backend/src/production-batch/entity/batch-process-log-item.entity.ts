import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export const numericColumnTransformer = {
  to: (data: number): number => data,
  from: (data: string): number => (data ? parseFloat(data) : 0),
};

@Entity('batch_process_log_item')
export class BatchProcessLogItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  batchProcessLogId: number;

  @Column({ type: 'int' })
  itemId: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    transformer: numericColumnTransformer,
  })
  loggedQty: number;
}
