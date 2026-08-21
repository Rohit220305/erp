import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Status } from 'src/package/common/enums/enum';

export class PackageAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  packageName: string;

  @IsString()
  @IsNotEmpty()
  packageCode: string;

  @IsOptional()
  @IsString()
  abbreviation: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status;
}

export class PackageUpdateDto extends PackageAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class PackageDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class PackageDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class PackageListDto {
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
  @Type(() => PackageFiltersDto)
  filters: PackageFiltersDto[];

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

export class PackageFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
