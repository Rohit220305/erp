import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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
  @IsString()
  remark: string;

  @IsOptional()
  @IsString()
  status: string;
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
