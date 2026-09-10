import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { MaterialRequestStatus } from '../enum/material-request.enum';

export class MaterialRequestItemDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  itemId: number;

  @IsNumber()
  @Min(0.0001)
  @Type(() => Number)
  @IsNotEmpty()
  requestedQty: number;
}

export class CreateMaterialRequestDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyId?: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  productionBatchId: number;

  @IsOptional()
  @IsString()
  remark?: string;

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
      return parsed.map((item: any) => plainToInstance(MaterialRequestItemDto, item));
    }
    return parsed;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequestItemDto)
  items: MaterialRequestItemDto[];
}

export class MarkMaterialRequestDeliveredDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  id: number;
}

export class CancelMaterialRequestDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  id: number;
}

export class MaterialRequestSuggestDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  productionBatchId: number;
}

export class MaterialRequestListDto {
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
  productionBatchId?: number;

  @IsOptional()
  @IsEnum(MaterialRequestStatus)
  status?: MaterialRequestStatus;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
