import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { AttachmentModule } from '../enums/attachment-module.enum';

@Entity('attachment_master')
@Index('idx_company_module_entity', ['companyId', 'moduleName', 'entityId'])
export class AttachmentMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id', type: 'int' })
  companyId: number;

  @Column({
    name: 'module_name',
    type: 'enum',
    enum: AttachmentModule,
  })
  moduleName: AttachmentModule;

  @Column({ name: 'entity_id', type: 'int' })
  entityId: number;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'stored_file_name', type: 'varchar', length: 255 })
  storedFileName: string;

  @Column({ name: 'file_size', type: 'int', default: 0 })
  fileSize: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;
}
