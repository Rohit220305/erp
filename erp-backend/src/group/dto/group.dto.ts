import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GroupAddDto {
  @IsString()
  @IsNotEmpty()
  groupCode: string;

  @IsString()
  @IsNotEmpty()
  groupName: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  status: string = 'active';

  @IsOptional()
  addedBy: number;
}

export class GroupUpdateDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsOptional()
  @IsString()
  groupCode: string;

  @IsOptional()
  @IsString()
  groupName: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  updatedBy: number;
}

export class GroupDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class GroupDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class GroupListDto {
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

  @IsOptional()
  @IsBoolean()
  includeSuperAdmin?: boolean;
}

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
