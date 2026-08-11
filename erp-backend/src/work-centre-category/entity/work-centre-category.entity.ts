import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Status } from 'src/package/common/enums/status.enum';

@Entity('work_centre_category')
@Unique(['categoryCode', 'companyId'])
@Unique(['categoryName', 'companyId'])
export class WorkCentreCategoryEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  categoryName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  categoryCode: string;

  @Column({ type: 'int' })
  companyId: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
