import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export enum PlantStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

@Entity('plant_master')
@Unique(['code', 'companyId'])
@Unique(['name', 'companyId'])
export class PlantEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string | null;

  @Column({
    type: 'enum',
    enum: PlantStatus,
    default: PlantStatus.Active,
  })
  status: PlantStatus;

}



