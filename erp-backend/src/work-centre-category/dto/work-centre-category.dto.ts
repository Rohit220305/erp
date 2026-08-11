import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class WorkCentreCategoryAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsString()
  @IsNotEmpty()
  categoryCode: string;

  @IsOptional()
  @IsString()
  status: string;
}

export class WorkCentreCategoryUpdateDto extends WorkCentreCategoryAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class WorkCentreCategoryDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class WorkCentreCategoryDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class WorkCentreCategoryListDto {
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
  @Type(() => WorkCentreCategoryFiltersDto)
  filters: WorkCentreCategoryFiltersDto[];

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

export class WorkCentreCategoryFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
