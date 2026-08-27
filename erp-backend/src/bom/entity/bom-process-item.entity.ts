import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { MaterialType } from '../enum/bom.enum';
import { YesNo } from '../../package/common/enums/enum';

export const numericColumnTransformer = {
  to: (data: number): number => data,
  from: (data: string): number => (data ? parseFloat(data) : 0),
};

@Entity('bom_process_items')
export class BomProcessItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  bomId: number;

  @Column({ type: 'int' })
  processTemplateMappingId: number;

  @Column({ type: 'enum', enum: MaterialType })
  materialType: MaterialType;

  @Column({ type: 'int' })
  itemId: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 4,
    transformer: numericColumnTransformer,
  })
  quantity: number;

  // NOTE: isPrimary scope (e.g. primary per step vs primary per BOM) and uniqueness
  // enforcement are currently TBD and deferred to a future feature. No validation exists in this pass.
  @Column({ type: 'enum', enum: YesNo, default: YesNo.No })
  isPrimary: YesNo;
}
