import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { AbstractBaseEntity } from '../../package/entities/base.entity';
import { Status } from '../../package/common/enums/enum';
import { ProductionMethod } from '../enum/bom.enum';

@Entity('bom_master')
@Unique(['bomCode', 'companyId'])
export class BomEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  bomName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bomCode: string | null;

  @Column({ type: 'enum', enum: ProductionMethod })
  productionMethod: ProductionMethod;

  @Column({ type: 'int' })
  itemId: number;

  @Column({ type: 'int' })
  processTemplateId: number;

  @Column({ type: 'int', nullable: true })
  customerId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceNumber: string | null;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'enum', enum: Status, default: Status.Active })
  status: Status;
}
