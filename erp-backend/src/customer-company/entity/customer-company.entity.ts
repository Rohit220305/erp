import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity('customer_company')
@Unique(['code', 'companyId'])
@Unique(['name', 'companyId'])
export class CustomerCompanyEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  shortName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'datetime', nullable: true })
  incorporationDate: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceCode: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}
