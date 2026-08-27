import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyEntity } from '../../company/entity/company.entity';
import { WorkCentreEntity } from '../../work-centre/entity/work-centre.entity';
import { AbstractBaseEntity } from 'src/package/entities/base.entity';

@Entity('process_master')
export class ProcessEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'processName', length: 255 })
  processName: string;

  @Column({ name: 'processCode', length: 255, nullable: true })
  processCode: string;

  @Column({ name: 'imageUrl', length: 255, nullable: true })
  imageUrl: string;

  @Column({ name: 'workCentreId' })
  workCentreId: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'companyId' })
  companyId: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: 'Active' | 'Inactive';


  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @ManyToOne(() => WorkCentreEntity)
  @JoinColumn({ name: 'workCentreId' })
  workCentre: WorkCentreEntity;
}
