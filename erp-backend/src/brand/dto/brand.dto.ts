import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Status } from 'src/package/common/enums/enum';

export class BrandAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  brandName: string;

  @IsString()
  @IsNotEmpty()
  brandCode: string;

  @IsOptional()
  @IsString()
  brandImage: string;

  @IsOptional()
  @Type(() => Number)
  manufacturerId: number;

  @IsOptional()
  @IsEnum(Status)
  status: Status;
}

export class BrandUpdateDto extends BrandAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class BrandDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class BrandDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class BrandListDto {
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
  @Type(() => BrandFiltersDto)
  filters: BrandFiltersDto[];

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

export class BrandFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
