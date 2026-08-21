import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Status } from 'src/package/common/enums/enum';

export class CompanyAddDto {
  @IsOptional()
  @Type(() => Number)
  parentCompanyId: number;

  @IsString()
  @IsNotEmpty()
  companyCode: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsOptional()
  shortName: string;

  @IsOptional()
  legalName: string;

  @IsOptional()
  registrationNumber: string;

  @IsOptional()
  taxNumber: string;

  @IsOptional()
  companyLogo: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  dialCode: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  website: string;

  @IsOptional()
  addressLine1: string;

  @IsOptional()
  addressLine2: string;

  @IsOptional()
  city: string;

  @IsOptional()
  state: string;

  @IsOptional()
  country: string;

  @IsOptional()
  zipCode: string;

  @IsOptional()
  contactPersonName: string;

  @IsOptional()
  @IsEmail()
  contactPersonEmail: string;

  @IsOptional()
  contactPersonPhone: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @IsOptional()
  addedBy: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean);
    }
    if (Array.isArray(value)) {
      return value;
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  supportedCurrencies?: string[];
}

export class CompanyUpdateDto extends CompanyAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class CompanyDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class CompanyDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class CompanyListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => filtersDto)
  filters: filtersDto[];

  @IsOptional()
  @IsString()
  logicalOperator: string;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class filtersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
