import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('customer_company_user')
export class CustomerCompanyUserEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int' })
  customerCompanyId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  code: string | null;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage: string | null;

  @Column({ type: 'datetime', nullable: true })
  dob: Date | null;

  @Column({ type: 'datetime', nullable: true })
  customDate: Date | null;

  @Column({ type: 'tinyint', default: 0 })
  isOwner: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phoneCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altPhoneCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altPhoneNumber: string | null;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}
