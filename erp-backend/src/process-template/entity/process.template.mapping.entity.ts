import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('process_template_mapping')
@Unique(['templateId', 'processId'])
export class ProcessTemplateMappingEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  templateId: number;

  @Column({ type: 'int' })
  processId: number;

  @Column({ type: 'int' })
  sequenceNo: number;

  @Column({ type: 'json', nullable: true })
  dependencies: number[] | null;

  @Column({ type: 'json', nullable: true })
  nodePosition: { x: number; y: number } | null;

  @Column({ type: 'json', nullable: true })
  handleConfig: Record<string, { sourceHandle: string; targetHandle: string }> | null;
}

