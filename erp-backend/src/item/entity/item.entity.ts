import { Status, UsageType, InventoryType, YesNo, ShelfLifeUnit } from 'src/package/common/enums/enum';
import { AbstractBaseEntity } from '../../package/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('item_master')
@Unique(['barcode', 'companyId'])
@Unique(['itemCode', 'companyId'])
@Unique(['referenceCode', 'companyId'])
export class ItemEntity extends AbstractBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  itemName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shortName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  printName: string | null;

  @Column({ type: 'varchar', length: 255 })
  itemCode: string;

  @Column({ type: 'enum', enum: UsageType })
  usageType: UsageType;

  @Column({ type: 'int' })
  categoryId: number;

  @Column({ type: 'int' })
  companyId: number;

  @Column({ type: 'int', nullable: true })
  manufacturerId: number | null;

  @Column({ type: 'int', nullable: true })
  brandId: number | null;

  @Column({ type: 'enum', enum: InventoryType })
  inventoryType: InventoryType;

  @Column({ type: 'enum', enum: YesNo })
  isDecimalAllowed: YesNo;

  @Column({ type: 'int', nullable: true })
  packageUomId: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitsPerPacking: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  primitiveQuantity: number | null;

  @Column({ type: 'int' })
  itemUomId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vendorBarcode: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currencyCode: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  purchasePrice: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPrice: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPerUnit: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number | null;

  @Column({ type: 'int', nullable: true })
  weightUomId: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  volume: number | null;

  @Column({ type: 'int', nullable: true })
  volumeUomId: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number | null;

  @Column({ type: 'int', nullable: true })
  dimensionUomId: number | null;

  @Column({ type: 'int', nullable: true })
  shelfLife: number | null;

  @Column({ type: 'enum', enum: ShelfLifeUnit, nullable: true })
  shelfLifeUnit: ShelfLifeUnit | null;

  @Column({ type: 'int', nullable: true })
  storageId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  batchCode: string | null;

  @Column({ type: 'enum', enum: YesNo, default: YesNo.No })
  isScrap: YesNo;

  @Column({ type: 'enum', enum: YesNo, default: YesNo.No })
  isInHouseProduction: YesNo;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ type: 'enum', enum: Status, default: Status.Active })
  status: Status;
}
