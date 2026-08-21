import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';

import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';


enum UomType {
   Length = 'length',
   Temperature = 'temperature',
   Density = 'density',
   Volume = 'volume',
   Weight = 'weight',
   Time = 'time',
   PumpingRate = 'pumping_rate',
 }


@Entity('item_uom_master')
@Unique(['itemUomCode', 'companyId'])
@Unique(['isoCode', 'companyId'])
@Unique(['uomName', 'companyId'])
export class ItemUomEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  uomName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  isoCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  abbreviation: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  itemUomCode: string | null;

  @Column({
    type: 'enum',
    enum: UomType,
  })
  unitType: UomType;

  @Column({ type: 'int' })
  companyId: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}
