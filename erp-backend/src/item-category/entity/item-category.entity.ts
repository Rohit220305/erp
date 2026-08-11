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

@Entity('item_category_master')
@Unique(['categoryCode', 'companyId'])
@Unique(['categoryName', 'companyId'])
export class ItemCategoryEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  categoryName: string;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  categoryCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceCode: string | null;

  @Column({ type: 'int', nullable: true })
  parentId: number | null;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @ManyToOne(() => ItemCategoryEntity)
  @JoinColumn({ name: 'parentId' })
  parentCategory: ItemCategoryEntity;
}
