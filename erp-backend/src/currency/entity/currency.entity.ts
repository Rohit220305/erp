import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'currency_master',
})
export class CurrencyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 10,
    unique: true,
  })
  currencyCode: string;

  @Column({
    length: 100,
  })
  currencyName: string;

  @Column({
    length: 10,
  })
  currencySymbol: string;


  @Column({
    type: 'enum',
    enum: ['Active', 'InActive'],
    default: 'Active',
  })
  status: string;

  @Column({
    nullable: true,
  })
  createdBy: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    nullable: true,
  })
  updatedBy: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date;
}
