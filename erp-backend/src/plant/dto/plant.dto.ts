import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { PlantStatus } from '../entity/plant.entity';

export class PlantAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  remark: string;

  @IsOptional()
  @IsEnum(PlantStatus)
  status: PlantStatus;
}

export class PlantUpdateDto extends PlantAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class PlantDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class PlantDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class PlantFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}

export class PlantListDto {
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
  @Type(() => PlantFiltersDto)
  filters: PlantFiltersDto[];

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
