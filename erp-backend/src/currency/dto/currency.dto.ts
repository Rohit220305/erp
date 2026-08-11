import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  ValidateNested,
} from 'class-validator';

export class FilterDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  operator: string;
}

export class CurrencyAddDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  currencyCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  currencyName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  currencySymbol: string;


  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsNumber()
  addedBy: number;
}

export class CurrencyUpdateDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currencyCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  currencyName: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currencySymbol: string;


  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsNumber()
  updatedBy: number;
}

export class DeleteCurrencyDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class GetCurrencyDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ListCurrencyDto {
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
  @Type(() => FilterDto)
  filters: FilterDto[];

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  logicalOperator?: 'AND' | 'OR';
}

export { CurrencyAddDto as currencyAddDto, CurrencyUpdateDto as currencyUpdateDto };