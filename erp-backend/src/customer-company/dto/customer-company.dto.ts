import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Status } from 'src/package/common/enums/enum';

export class AddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  zipCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phoneCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altPhoneCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altPhoneNumber?: string;
}

export class AddCustomerCompanyUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customerCompanyId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  profileImage?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsDateString()
  customDate?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  isOwner?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phoneCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altPhoneCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altPhoneNumber?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(AddressDto, parsed);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class AddCustomerCompanyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  shortName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string;

  @IsOptional()
  @IsDateString()
  incorporationDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referenceCode?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(AddressDto, parsed);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return plainToInstance(AddCustomerCompanyUserDto, parsed);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => AddCustomerCompanyUserDto)
  owner?: AddCustomerCompanyUserDto;
}

export class UpdateCustomerCompanyDto extends AddCustomerCompanyDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class DeleteCustomerCompanyDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class CustomerCompanyDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class CustomerCompanyFiltersDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  @IsNotEmpty()
  operator: string;
}

export class CustomerCompanyListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomerCompanyFiltersDto)
  filters?: CustomerCompanyFiltersDto[];

  @IsOptional()
  @IsString()
  logicalOperator?: 'AND' | 'OR';

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class UpdateCustomerCompanyUserDto extends AddCustomerCompanyUserDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class DeleteCustomerCompanyUserDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class CustomerCompanyUserDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class CustomerCompanyUserFiltersDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  @IsNotEmpty()
  operator: string;
}

export class CustomerCompanyUserListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerCompanyId?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomerCompanyUserFiltersDto)
  filters?: CustomerCompanyUserFiltersDto[];

  @IsOptional()
  @IsString()
  logicalOperator?: 'AND' | 'OR';

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
