import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('manufacturer_master')
@Unique(['manufacturerCode', 'companyId'])
export class ManufacturerEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  manufacturerName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturerCode: string | null;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceCode: string | null;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;
}
