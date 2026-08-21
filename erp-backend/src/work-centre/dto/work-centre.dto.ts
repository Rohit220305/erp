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
import { UsageStatus } from '../entity/work-centre.entity';

export class WorkCentreAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  workCentreName: string;

  @IsOptional()
  @IsString()
  workCentreCode: string;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsEnum(UsageStatus)
  usageStatus: UsageStatus;

  @IsOptional()
  @IsEnum(Status)
  status: Status;
}

export class WorkCentreUpdateDto extends WorkCentreAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class WorkCentreDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class WorkCentreDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class WorkCentreListDto {
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
  @Type(() => WorkCentreFiltersDto)
  filters: WorkCentreFiltersDto[];

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

export class WorkCentreFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
