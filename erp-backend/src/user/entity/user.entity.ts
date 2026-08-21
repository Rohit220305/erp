import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AbstractBaseEntity } from 'src/package/entities/base.entity';
import { Status } from 'src/package/common/enums/enum';

@Entity({
  name: 'users',
})
export class UserEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyId: number;

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
    length: 6,
    nullable: true,
  })
  resetPasswordOtp: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  resetPasswordOtpExpiry: Date;

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
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @Column({
    type: 'tinyint',
    default: 0,
    name: 'isSuperAdmin',
  })
  isSuperAdmin: boolean;
}
