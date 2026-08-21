import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Status } from 'src/package/common/enums/enum';

export class ItemCategoryAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsOptional()
  @IsString()
  categoryCode: string;

  @IsOptional()
  @IsString()
  referenceCode: string;

  @IsOptional()
  @Type(() => Number)
  parentId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  storageIds?: number[];
  
  @IsOptional()
  @IsEnum(Status)
  status: Status;
}

export class ItemCategoryUpdateDto extends ItemCategoryAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ItemCategoryDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ItemCategoryDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ItemCategoryListDto {
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
  @Type(() => Number)
  @IsInt()
  storageId?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemCategoryFiltersDto)
  filters: ItemCategoryFiltersDto[];

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

export class ItemCategoryFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
