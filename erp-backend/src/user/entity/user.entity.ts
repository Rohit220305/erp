import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyId: number;

  @Column()
  groupId: number;

  @Column({
    length: 100,
    unique: true,
  })
  userName: string;

  @Column({
    length: 100,
  })
  firstName: string;

  @Column({
    length: 100,
  })
  lastName: string;

  @Column({
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    length: 255,
  })
  password: string;

  @Column({
    length: 10,
    nullable: true,
  })
  dialCode: string;

  @Column({
    length: 20,
    nullable: true,
  })
  phone: string;

  @Column({
    length: 255,
    nullable: true,
  })
  profilePhoto: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastLoginDate: Date;

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
}
