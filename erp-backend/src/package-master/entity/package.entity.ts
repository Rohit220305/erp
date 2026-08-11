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

@Entity('package_master')
@Unique(['packageCode', 'companyId'])
@Unique(['packageName', 'companyId'])
export class PackageEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  packageName: string;

  @Column({ type: 'varchar', length: 255 })
  packageCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  abbreviation: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

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
