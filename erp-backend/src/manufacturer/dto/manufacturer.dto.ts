import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ManufacturerAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  manufacturerName: string;

  @IsOptional()
  @IsString()
  manufacturerCode: string;

  @IsOptional()
  @IsString()
  referenceCode: string;


  @IsOptional()
  @IsString()
  status: string;
}

export class ManufacturerUpdateDto extends ManufacturerAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ManufacturerDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ManufacturerDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ManufacturerListDto {
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
  @Type(() => ManufacturerFiltersDto)
  filters: ManufacturerFiltersDto[];

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

export class ManufacturerFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
