import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('item_category_storage_mapping')
export class ItemCategoryStorageMappingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  categoryId: number;

  @Column({ type: 'int' })
  storageId: number;
}
