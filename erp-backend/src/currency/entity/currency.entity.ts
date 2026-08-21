import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';

@Entity({
  name: 'currency_master',
})
export class CurrencyEntity extends AbstractBaseEntity {
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
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}
