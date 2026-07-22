import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { GroupEntity } from 'src/group/entity/group.entity';
import { CapabilityEntity } from './capability.entity';

@Entity('group_capabilities')
@Unique('uniq_group_capability', ['groupId', 'capabilityId'])
export class GroupCapabilityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @Column()
  capabilityId: number;

  @Column({
    type: 'enum',
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status: string;

  @Column({
    nullable: true,
  })
  addedBy: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
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

  @ManyToOne(() => GroupEntity)
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity;

  @ManyToOne(() => CapabilityEntity)
  @JoinColumn({ name: 'capabilityId' })
  capability: CapabilityEntity;
}
