import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity('brand_master')
@Unique(['brandCode', 'companyId'])
@Unique(['brandName', 'companyId'])
export class BrandEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  brandName: string;

  @Column({ type: 'varchar', length: 255 })
  brandCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brandImage: string | null;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int', nullable: true })
  manufacturerId: number | null;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}
