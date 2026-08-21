import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { Status, ExecutionType } from 'src/package/common/enums/enum';

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

  @Column({ type: 'enum', enum: ExecutionType, default: ExecutionType.Flexible })
  executionType: ExecutionType;

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
}
