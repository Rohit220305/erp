import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Status, UsageType, InventoryType, YesNo, ShelfLifeUnit } from 'src/package/common/enums/enum';

export class ItemAddDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  printName?: string;

  @IsString()
  @IsNotEmpty()
  itemCode: string;

  @IsEnum(UsageType)
  @IsNotEmpty()
  usageType: UsageType;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  companyId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  manufacturerId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  brandId: number;

  @IsEnum(InventoryType)
  @IsNotEmpty()
  inventoryType: InventoryType;

  @IsEnum(YesNo)
  @IsNotEmpty()
  isDecimalAllowed: YesNo;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  packageUomId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  unitsPerPacking: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  primitiveQuantity: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  itemUomId: number;

  @IsOptional()
  @IsString()
  referenceCode?: string;

  @IsNotEmpty()
  @IsString()
  barcode: string;

  @IsOptional()
  @IsString()
  vendorBarcode?: string;

  @IsNotEmpty()
  @IsString()
  currencyCode: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  purchasePrice: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  costPrice: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  costPerUnit: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  weightUomId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  volume?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  volumeUomId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  length?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dimensionUomId?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  shelfLife: number;

  @IsNotEmpty()
  @IsEnum(ShelfLifeUnit)
  shelfLifeUnit: ShelfLifeUnit;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  storageId: number;

  @IsNotEmpty()
  @IsString()
  batchCode: string;

  @IsNotEmpty()
  @IsEnum(YesNo)
  isScrap: YesNo;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  primaryImageIndex?: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class ItemUpdateDto extends ItemAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsOptional()
  @IsString()
  existingImages?: string; 
}

export class ItemDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ItemDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ItemFiltersDto {
  @IsString()
  key: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  operator: string;
}

export class ItemListDto {
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
  search?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemFiltersDto)
  filters?: ItemFiltersDto[];

  @IsOptional()
  @IsString()
  logicalOperator?: string;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
