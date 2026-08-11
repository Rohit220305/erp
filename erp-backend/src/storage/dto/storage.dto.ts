import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class StorageAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  storageName: string;

  @IsString()
  @IsNotEmpty()
  storageCode: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  storageImage: string;

  @IsOptional()
  @IsString()
  status: string;
}

export class StorageUpdateDto extends StorageAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class StorageDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class StorageDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class StorageListDto {
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
  @Type(() => StorageFiltersDto)
  filters: StorageFiltersDto[];

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

export class StorageFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
