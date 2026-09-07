import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductionOrderStatus } from '../enum/production-order.enum';

export class ProductionOrderAddDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyId?: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  bomId: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  itemId: number;

  @IsNumber()
  @Min(0.0001)
  @Type(() => Number)
  @IsNotEmpty()
  productionQuantity: number;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsString()
  @IsNotEmpty()
  productionDate: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  plantId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customerId?: number;

  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus = ProductionOrderStatus.Pending;
}

export class ProductionOrderUpdateDto extends ProductionOrderAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsString()
  retainedAttachments?: string;
}

export class ProductionOrderDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;
}

export class ProductionOrderDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;
}

export class ProductionOrderListDto {
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
  itemId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bomId?: number;

  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;

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
