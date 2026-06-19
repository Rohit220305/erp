import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('group_master')
export class GroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  groupCode: string;

  @Column()
  groupName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: ['Active', 'InActive'],
    default: 'Active',
  })
  status: string;

  @Column({
    nullable: true,
  })
  addedBy: number;

  @Column({
    type: 'timestamp',
  })
  addedDate: Date;

  @Column({
    nullable: true,
  })
  updatedBy: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  updatedDate: Date;
}
