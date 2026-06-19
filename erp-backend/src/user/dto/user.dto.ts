import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsIn,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class UserAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  companyId: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  groupId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  userName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  dialCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @IsOptional()
  @IsIn(['Active', 'InActive'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  addedBy?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  isSuperAdmin?: boolean;
}

export class  UserUpdateDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  companyId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  groupId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  userName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  dialCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @IsOptional()
  @IsIn(['Active', 'InActive'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  updatedBy?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  isSuperAdmin?: boolean;
}

export class UserDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class UserDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class UserListDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  search?: string;

  @IsOptional()
  filters?: any[];
}

export class UserLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
