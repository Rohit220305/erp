import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Status, YesNo } from '../../package/common/enums/enum';
import { MaterialType, ProductionMethod } from '../enum/bom.enum';

export class BomProcessItemDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  processTemplateMappingId: number;

  @IsEnum(MaterialType)
  @IsNotEmpty()
  materialType: MaterialType;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  itemId: number;

  @IsNumber()
  @Min(0.0001)
  @Type(() => Number)
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsBoolean()
  isInternalTransfer?: boolean;

  @IsOptional()
  @IsEnum(YesNo)
  isPrimary?: YesNo = YesNo.No;
}

export class BomAddDto {
  @IsOptional()
  @Type(() => Number)
  companyId?: number;

  @IsString()
  @IsNotEmpty()
  bomName: string;

  @IsOptional()
  @IsString()
  bomCode?: string;

  @IsEnum(ProductionMethod)
  @IsNotEmpty()
  productionMethod: ProductionMethod;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  itemId: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  processTemplateId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customerId?: number;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status = Status.Active;


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
      return parsed.map((item: any) => plainToInstance(BomProcessItemDto, item));
    }
    return parsed;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomProcessItemDto)
  items: BomProcessItemDto[];
}

export class BomUpdateDto extends BomAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsString()
  retainedAttachments?: string;
}

export class BomDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;
}

export class BomDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  id: number;
}

export class BomListDto {
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
  processTemplateId?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

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
