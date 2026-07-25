import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

@Entity('user_groups')
export class UserGroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  groupId: number;

  @Column({ type: 'tinyint', default: 0 })
  isPrimary: boolean;

  @Column({ type: 'enum', enum: ['Active', 'Inactive'], default: 'Active' })
  status: string;

  @Column({ nullable: true })
  addedBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  addedDate: Date;

//   @ManyToOne(() => UserEntity, (user) => user.userGroups, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'userId' })
//   user: UserEntity;

  @ManyToOne(() => GroupEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity;
}

