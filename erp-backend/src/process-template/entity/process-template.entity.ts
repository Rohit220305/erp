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

@Entity('process_template')
@Unique(['templateCode', 'companyId'])
@Unique(['templateName', 'companyId'])
export class ProcessTemplateEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  templateName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  templateCode: string;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

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
