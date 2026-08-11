import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractBaseEntity {
  @Column({ type: 'int', nullable: true })
  addedBy: number | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  addedDate: Date;

  @Column({ type: 'int', nullable: true })
  updatedBy: number | null;

  @UpdateDateColumn({ 
    type: 'datetime', 
    nullable: true, 
    onUpdate: 'CURRENT_TIMESTAMP' 
  })
  updatedDate: Date | null;

  @Column({ type: 'tinyint', default: 0, name: 'sysRecDeleted' })
  sysRecDeleted: boolean;
}
