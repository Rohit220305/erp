import { Global, Module } from "@nestjs/common";
import { ModSettingEntity } from "./entity/mod-setting.entity";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";
import { ModSettingCacheService } from "./service/mod-setting.cache.service";
import { ModSettingService } from "./service/mod-setting.service";
import { ActivityLogModule } from "src/activity-log/activity-log.module";
import { GeneralUtilities } from "src/package/utilities/general.utilities";
import { ModSettingListService } from "./service/mod-setting.list.service";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ModSettingEntity]), ActivityLogModule],
  providers: [
    ModSettingService,
    ModSettingCacheService,
    ModSettingListService,
    GeneralUtilities,
  ],
  exports: [ModSettingCacheService],
})
export class ModSettingModule {}