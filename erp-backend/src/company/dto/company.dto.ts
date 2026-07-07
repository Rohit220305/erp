import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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
  status: string;

  @IsOptional()
  addedBy: number;
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
}

export class filtersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
