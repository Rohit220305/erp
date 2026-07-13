import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { CompanyEntity } from "src/company/entity/company.entity";
import { GroupEntity } from "src/group/entity/group.entity";
import { UserEntity } from "src/user/entity/user.entity";
import { CapabilityEntity } from "src/capability/entity/capability.entity";
import { GroupCapabilityEntity } from "src/capability/entity/group-capability.entity";
import { ActivityLogEntity } from "src/activity-log/entity/activity-log.entity";
import { ActivityMasterEntity } from "src/activity-log/entity/activity-master.entity";
dotenv.config();


export const typeOrmConfig: TypeOrmModuleOptions = {
  type: process.env.DB_CLIENT as 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [
    UserEntity,
    CompanyEntity,
    GroupEntity,
    CapabilityEntity,
    GroupCapabilityEntity,
    ActivityLogEntity,
    ActivityMasterEntity,
  ],
  synchronize: false,
  migrationsRun: false,
  logging: false,
  migrations: [__dirname + '/migrations/*.ts'],
};