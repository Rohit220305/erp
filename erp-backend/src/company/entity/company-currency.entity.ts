import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('company_currency_mapping')
export class CompanyCurrencyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyId: number;

  @Column({ length: 10 })
  currencyCode: string;

  @Column({ nullable: true })
  addedBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  addedDate: Date;
}
