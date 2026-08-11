import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Status } from 'src/package/common/enums/status.enum';

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

export class CreateCapabilityDto {
  @IsString()
  @IsNotEmpty()
  capabilityCode: string;

  @IsString()
  @IsNotEmpty()
  capabilityName: string;

  @IsString()
  @IsNotEmpty()
  moduleName: string;

  @IsString()
  @IsNotEmpty()
  actionName: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  addedBy: number;
}

export class UpdateCapabilityDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsOptional()
  @IsString()
  capabilityCode: string;

  @IsOptional()
  @IsString()
  capabilityName: string;

  @IsOptional()
  @IsString()
  moduleName: string;

  @IsOptional()
  @IsString()
  actionName: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  updatedBy: number;
}

export class DeleteCapabilityDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class GetCapabilityDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ListCapabilitiesDto {
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
}

export class AssignGroupCapabilitiesDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  groupId: number;

  @IsArray()
  @IsInt({ each: true })
  capabilityIds: number[];

  @IsOptional()
  addedBy: number;
}

export class  RemoveGroupCapabilityDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  groupId: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  capabilityId: number;
}

export class GetByGroupDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  groupId: number;
}

export class ListGroupCapabilitiesDto {
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
}
