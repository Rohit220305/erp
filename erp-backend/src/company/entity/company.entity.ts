import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('company')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  parentCompanyId: number;

  @Column({ unique: true })
  companyCode: string;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({ nullable: true })
  legalName: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  taxNumber: string;

  @Column({ nullable: true })
  companyLogo: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  dialCode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  contactPersonName: string;

  @Column({ nullable: true })
  contactPersonEmail: string;

  @Column({ nullable: true })
  contactPersonPhone: string;

  @Column({
    type: 'enum',
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  @Column({ nullable: true })
  addedBy: number;

  @Column({ type: 'timestamp' })
  addedDate: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updatedDate: Date;
}
