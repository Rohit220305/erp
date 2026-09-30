
// CREATE TABLE `mod_setting` (
//   `id` INT NOT NULL AUTO_INCREMENT,
//   `name` VARCHAR(255) NOT NULL,
//   `code` VARCHAR(255) NOT NULL,
//   `value` VARCHAR(255) NOT NULL,
//   `status` ENUM ('Active','Inactive'),
//   `addedBy` INT NULL,
//   `addedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   `updatedBy` INT DEFAULT NULL,
//   `updatedDate` DATETIME NULL ,
//   `sysRecDeleted` TINYINT NOT NULL DEFAULT 0,
//   PRIMARY KEY (`id`)
// );

import { Status } from "src/package/common/enums/enum";
import { AbstractBaseEntity } from "src/package/entities/base.entity";
import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('mod_setting')
export class ModSettingEntity extends AbstractBaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    code: string;

    @Column({ type: 'varchar', length: 255 })
    value: string;

    @Column({ type: 'enum', enum: Status, default: Status.Active })
    status: Status;

}