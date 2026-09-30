import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('address')
@Index(['entityType', 'entityId'])
export class AddressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  entityId: number;

  @Column({ type: 'varchar', length: 50 })
  entityType: string;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  zipCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phoneCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altPhoneCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altPhoneNumber: string | null;

  @Column({ type: 'tinyint', default: 0, name: 'sysRecDeleted' })
  sysRecDeleted: boolean;
}
