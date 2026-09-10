import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export const numericColumnTransformer = {
  to: (data: number): number => data,
  from: (data: string): number => (data ? parseFloat(data) : 0),
};

@Entity('material_request_details')
export class MaterialRequestItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int' })
  materialRequestId: number;

  @Column({ type: 'int' })
  itemId: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    default: 0,
    transformer: numericColumnTransformer,
  })
  requestedQty: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    default: 0,
    transformer: numericColumnTransformer,
  })
  receivedQty: number;
}
