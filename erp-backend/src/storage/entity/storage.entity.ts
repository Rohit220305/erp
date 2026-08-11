import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Status } from 'src/package/common/enums/status.enum';

@Entity('storage_master')
@Unique(['storageCode', 'companyId'])
@Unique(['storageName', 'companyId'])
export class StorageEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  storageName: string;

  @Column({ type: 'varchar', length: 255 })
  storageCode: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  storageImage: string | null;

  @Column({ type: 'int' })
  companyId: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;
}
