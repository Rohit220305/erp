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
import { Status, ExecutionType } from 'src/package/common/enums/enum';

export class ProcessMappingItemDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  processId: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  sequenceNo: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  dependencies?: number[];

  @IsOptional()
  nodePosition?: { x: number; y: number };

  @IsOptional()
  handleConfig?: Record<string, { sourceHandle: string; targetHandle: string }>;
}

export class ProcessTemplateAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsNotEmpty()
  templateName: string;

  @IsString()
  @IsNotEmpty()
  templateCode: string;

  @IsOptional()
  @IsEnum(ExecutionType)
  executionType?: ExecutionType;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessMappingItemDto)
  processes?: ProcessMappingItemDto[];
}


export class ProcessTemplateUpdateDto extends ProcessTemplateAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ProcessTemplateDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ProcessTemplateDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ProcessTemplateListDto {
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
  @Type(() => ProcessTemplateFiltersDto)
  filters: ProcessTemplateFiltersDto[];

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

export class ProcessTemplateFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}
