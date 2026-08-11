-- manufacturer_master
ALTER TABLE manufacturer_master 
  DROP FOREIGN KEY fk_manufacturer_company;
ALTER TABLE manufacturer_master 
  DROP INDEX uniq_manufacturer_code_company;

ALTER TABLE manufacturer_master
  MODIFY manufacturerName VARCHAR(255) NOT NULL,
  MODIFY manufacturerCode VARCHAR(255) NULL,
  MODIFY referenceCode VARCHAR(255) NULL,
  ADD UNIQUE KEY (manufacturerCode, companyId),
  ADD FOREIGN KEY (companyId) REFERENCES company(id);

-- storage_master
ALTER TABLE storage_master
  DROP FOREIGN KEY fk_storage_company;
ALTER TABLE storage_master
  DROP INDEX uniq_storage_code_company,
  DROP INDEX uniq_storage_name_company;

ALTER TABLE storage_master
  MODIFY storageName VARCHAR(255) NOT NULL,
  MODIFY storageCode VARCHAR(255) NOT NULL,
  ADD UNIQUE KEY (storageCode, companyId),
  ADD UNIQUE KEY (storageName, companyId),
  ADD FOREIGN KEY (companyId) REFERENCES company(id);

-- item_category_master
ALTER TABLE item_category_master
  DROP FOREIGN KEY fk_category_company,
  DROP FOREIGN KEY fk_category_parent;
ALTER TABLE item_category_master
  DROP INDEX uniq_category_code,
  DROP INDEX uniq_category_name_parent;

ALTER TABLE item_category_master
  MODIFY categoryName VARCHAR(255) NOT NULL,
  MODIFY categoryCode VARCHAR(255) NULL,
  MODIFY referenceCode VARCHAR(255) NULL,
  ADD UNIQUE KEY (categoryCode, companyId),
  ADD UNIQUE KEY (categoryName, companyId),
  ADD FOREIGN KEY (companyId) REFERENCES company(id),
  ADD FOREIGN KEY (parentId) REFERENCES item_category_master(id);

-- item_category_storage_mapping
ALTER TABLE item_category_storage_mapping
  DROP FOREIGN KEY fk_mapping_category,
  DROP FOREIGN KEY fk_mapping_storage;

ALTER TABLE item_category_storage_mapping
  ADD FOREIGN KEY (categoryId) REFERENCES item_category_master(id),
  ADD FOREIGN KEY (storageId) REFERENCES storage_master(id);

-- brand_master
ALTER TABLE brand_master
  DROP FOREIGN KEY fk_brand_company,
  DROP FOREIGN KEY fk_brand_manufacturer;
ALTER TABLE brand_master
  DROP INDEX uniq_brand_code_company;

ALTER TABLE brand_master
  MODIFY brandName VARCHAR(255) NOT NULL,
  MODIFY brandCode VARCHAR(255) NOT NULL,
  ADD UNIQUE KEY (brandCode, companyId),
  ADD UNIQUE KEY (brandName, companyId),
  ADD FOREIGN KEY (companyId) REFERENCES company(id),
  ADD FOREIGN KEY (manufacturerId) REFERENCES manufacturer_master(id);

-- package_master
ALTER TABLE package_master
  DROP FOREIGN KEY fk_package_company;
ALTER TABLE package_master
  DROP INDEX uniq_package_code_company,
  DROP INDEX uniq_package_name_company;

ALTER TABLE package_master
  MODIFY packageName VARCHAR(255) NOT NULL,
  MODIFY packageCode VARCHAR(255) NOT NULL,
  MODIFY abbreviation VARCHAR(255) NULL,
  ADD UNIQUE KEY (packageCode, companyId),
  ADD UNIQUE KEY (packageName, companyId),
  ADD FOREIGN KEY (companyId) REFERENCES company(id);

-- item_uom_master
ALTER TABLE item_uom_master
  DROP FOREIGN KEY fk_uom_company;
ALTER TABLE item_uom_master
  DROP INDEX uniq_uom_iso_code_company,
  DROP INDEX uniq_uom_name_company;

ALTER TABLE item_uom_master
  MODIFY uomName VARCHAR(255) NOT NULL,
  MODIFY isoCode VARCHAR(255) NULL,
  MODIFY abbreviation VARCHAR(255) NULL,
  ADD COLUMN itemUomCode VARCHAR(255) NULL AFTER id,
  ADD UNIQUE KEY (itemUomCode, companyId),
  ADD UNIQUE KEY (isoCode, companyId),
  ADD UNIQUE KEY (uomName, companyId),
  ADD FOREIGN KEY (companyId) REFERENCES company(id);

-- item_images
ALTER TABLE item_images
  DROP FOREIGN KEY fk_itemimage_item;
ALTER TABLE item_images
  ADD FOREIGN KEY (itemId) REFERENCES item_master(id);

-- item_master
ALTER TABLE item_master
  DROP FOREIGN KEY fk_item_category,
  DROP FOREIGN KEY fk_item_company,
  DROP FOREIGN KEY fk_item_manufacturer,
  DROP FOREIGN KEY fk_item_brand,
  DROP FOREIGN KEY fk_item_packageUom,
  DROP FOREIGN KEY fk_item_uom,
  DROP FOREIGN KEY fk_item_currency,
  DROP FOREIGN KEY fk_item_weight_uom,
  DROP FOREIGN KEY fk_item_volume_uom,
  DROP FOREIGN KEY fk_item_dimension_uom;

ALTER TABLE item_master
  DROP INDEX uniq_barcode_company,
  DROP INDEX uniq_item_ref_code_company;

ALTER TABLE item_master
  MODIFY itemName VARCHAR(255) NOT NULL,
  MODIFY shortName VARCHAR(255) NULL,
  MODIFY printName VARCHAR(255) NULL,
  MODIFY itemCode VARCHAR(255) NOT NULL,
  MODIFY referenceCode VARCHAR(255) NULL,
  MODIFY barcode VARCHAR(255) NULL,
  MODIFY vendorBarcode VARCHAR(255) NULL,
  MODIFY batchCode VARCHAR(255) NULL,
  ADD UNIQUE KEY (itemCode, companyId),
  ADD UNIQUE KEY (barcode, companyId),
  ADD UNIQUE KEY (referenceCode, companyId),
  ADD FOREIGN KEY (categoryId) REFERENCES item_category_master(id),
  ADD FOREIGN KEY (companyId) REFERENCES company(id),
  ADD FOREIGN KEY (manufacturerId) REFERENCES manufacturer_master(id),
  ADD FOREIGN KEY (brandId) REFERENCES brand_master(id),
  ADD FOREIGN KEY (packageUomId) REFERENCES package_master(id),
  ADD FOREIGN KEY (itemUomId) REFERENCES item_uom_master(id),
  ADD FOREIGN KEY (currencyId) REFERENCES currency_master(id),
  ADD FOREIGN KEY (weightUomId) REFERENCES item_uom_master(id),
  ADD FOREIGN KEY (volumeUomId) REFERENCES item_uom_master(id),
  ADD FOREIGN KEY (dimensionUomId) REFERENCES item_uom_master(id);

-- work_centre_category
ALTER TABLE work_centre_category
  DROP FOREIGN KEY fk_wc_category_company;
ALTER TABLE work_centre_category
  DROP INDEX uniq_wc_category_code,
  DROP INDEX uniq_wc_category_name;

ALTER TABLE work_centre_category
  MODIFY categoryName VARCHAR(255) NOT NULL,
  MODIFY categoryCode VARCHAR(255) NULL,
  ADD UNIQUE KEY (categoryCode, companyId),
  ADD UNIQUE KEY (categoryName, companyId),
  ADD FOREIGN KEY (companyId) REFERENCES company(id);

-- work_centre_master
ALTER TABLE work_centre_master
  DROP FOREIGN KEY fk_wc_master_category,
  DROP FOREIGN KEY fk_wc_master_company;
ALTER TABLE work_centre_master
  DROP INDEX uniq_work_centre_code,
  DROP INDEX uniq_work_centre_name;

ALTER TABLE work_centre_master
  MODIFY workCentreName VARCHAR(255) NOT NULL,
  MODIFY workCentreCode VARCHAR(255) NULL,
  ADD UNIQUE KEY (workCentreCode, companyId),
  ADD UNIQUE KEY (workCentreName, companyId),
  ADD FOREIGN KEY (categoryId) REFERENCES work_centre_category(id),
  ADD FOREIGN KEY (companyId) REFERENCES company(id);

-- process_master
ALTER TABLE process_master
  DROP FOREIGN KEY fk_process_workcentre,
  DROP FOREIGN KEY fk_process_company;
ALTER TABLE process_master
  DROP INDEX uniq_process_code,
  DROP INDEX uniq_process_name_company;

ALTER TABLE process_master
  MODIFY processName VARCHAR(255) NOT NULL,
  MODIFY processCode VARCHAR(255) NULL,
  ADD UNIQUE KEY (processCode, companyId),
  ADD UNIQUE KEY (processName, companyId),
  ADD FOREIGN KEY (workCentreId) REFERENCES work_centre_master(id),
  ADD FOREIGN KEY (companyId) REFERENCES company(id);

-- process_template
ALTER TABLE process_template
  DROP FOREIGN KEY fk_template_company;
ALTER TABLE process_template
  DROP INDEX uniq_template_code,
  DROP INDEX uniq_template_name_company;

ALTER TABLE process_template
  MODIFY templateName VARCHAR(255) NOT NULL,
  MODIFY templateCode VARCHAR(255) NULL,
  ADD UNIQUE KEY (templateCode, companyId),
  ADD UNIQUE KEY (templateName, companyId),
  ADD FOREIGN KEY (companyId) REFERENCES company(id);

-- process_template_mapping
ALTER TABLE process_template_mapping
  DROP FOREIGN KEY fk_mapping_template,
  DROP FOREIGN KEY fk_mapping_process;
ALTER TABLE process_template_mapping
  DROP INDEX uniq_template_process;

ALTER TABLE process_template_mapping
  ADD UNIQUE KEY (templateId, processId),
  ADD FOREIGN KEY (templateId) REFERENCES process_template(id),
  ADD FOREIGN KEY (processId) REFERENCES process_master(id);
