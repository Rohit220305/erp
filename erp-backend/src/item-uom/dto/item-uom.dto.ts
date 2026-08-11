import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ItemUomAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  uomName: string;

  @IsString()
  @IsNotEmpty()
  isoCode: string;

  @IsOptional()
  @IsString()
  itemUomCode: string;

  @IsOptional()
  @IsString()
  abbreviation: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['length', 'temperature', 'density', 'volume', 'weight', 'time', 'pumping_rate'])
  unitType: string;

  @IsOptional()
  @IsString()
  status: string;
}

export class ItemUomUpdateDto extends ItemUomAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ItemUomDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ItemUomDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ItemUomListDto {
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
  @Type(() => ItemUomFiltersDto)
  filters: ItemUomFiltersDto[];

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

export class ItemUomFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
