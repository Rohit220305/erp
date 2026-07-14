import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogEntity } from './entity/activity-log.entity';
import { ActivityMasterEntity } from './entity/activity-master.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { ActivityLogService } from './service/activity-log.service';
import { ActivityLogListService } from './service/activity-log.list.service';
import { ActivityLogController } from './controller/activity-log.controller';
import { AuthModule } from '../auth/auth.module';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLogEntity, ActivityMasterEntity, UserEntity]),
    forwardRef(() => AuthModule),
  ],
  providers: [ActivityLogService, ActivityLogListService, GeneralUtilities],
  controllers: [ActivityLogController],
  exports: [ActivityLogService, ActivityLogListService],
})
export class ActivityLogModule {}
