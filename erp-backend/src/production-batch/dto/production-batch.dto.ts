import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Status } from '../../package/common/enums/enum';
import { MaterialType, ProductionBatchStatus, LogType } from '../enum/production-batch.enum';

export class ProductionBatchProcessItemDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  productionBatchProcessId?: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  itemId: number;

  @IsEnum(MaterialType)
  @IsNotEmpty()
  materialType: MaterialType;

  @IsNumber()
  @Min(0.0001)
  @Type(() => Number)
  @IsNotEmpty()
  requiredQty: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  shortage: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  requestedQty?: number;
}

export class ProductionBatchProcessDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  processTemplateMappingId: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  processId: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  sequenceNumber: number;

  @Transform(({ value }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        parsed = [];
      }
    }
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => plainToInstance(ProductionBatchProcessItemDto, item));
    }
    return parsed;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionBatchProcessItemDto)
  items: ProductionBatchProcessItemDto[];
}

export class ProductionBatchAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId?: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  productionOrderId: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  bomId: number;

  @IsOptional()
  @IsString()
  batchCode?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  itemId?: number;

  @IsNumber()
  @Min(0.0001)
  @Type(() => Number)
  @IsNotEmpty()
  batchQuantity: number;

  @Transform(({ value }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        parsed = [];
      }
    }
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => plainToInstance(ProductionBatchProcessDto, item));
    }
    return parsed;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionBatchProcessDto)
  processes: ProductionBatchProcessDto[];
}

export class ProductionBatchDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;
}

export class ProductionBatchDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;
}

export class ProductionBatchSuggestDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  productionOrderId: number;
}

export class ProductionBatchListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productionOrderId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bomId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  itemId?: number;

  @IsOptional()
  @IsEnum(ProductionBatchStatus)
  status?: ProductionBatchStatus;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsArray()
  filters?: any[];

  @IsOptional()
  @IsString()
  logicalOperator?: string;
}

export class ProcessDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  batchId: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  processExecutionId: number;
}

export class CreateProcessLogItemDto {
  @IsInt()
  @IsNotEmpty()
  itemId: number;

  @IsNumber()
  @IsNotEmpty()
  loggedQty: number;
}

export class CreateProcessLogDto {
  @IsInt()
  @IsNotEmpty()
  productionBatchId: number;

  @IsInt()
  @IsNotEmpty()
  productionBatchProcessId: number;

  @IsEnum(LogType)
  @IsNotEmpty()
  logType: LogType;

  @IsDateString()
  @IsNotEmpty()
  logDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProcessLogItemDto)
  @IsNotEmpty()
  items: CreateProcessLogItemDto[];
}

export class ProcessExecutionDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  batchId: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  processExecutionId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  producedQty?: number;
}

export class MarkBatchCompletedDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  batchId: number;
}

