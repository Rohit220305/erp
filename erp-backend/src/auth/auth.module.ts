import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';

import { AuthGuard } from './auth.guard';
import { PermissionGuard } from './permission.guard';
import { PermissionCacheService } from './permission.cache.service';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { UserEntity } from 'src/user/entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';
import { GroupCapabilityEntity } from 'src/capability/entity/group-capability.entity';

@Module({
  imports: [
    // Global JwtModule — available across all modules
    JwtModule.register({ global: true }),
    TypeOrmModule.forFeature([UserEntity, CompanyEntity, GroupEntity, GroupCapabilityEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GeneralUtilities,
    Reflector,
    PermissionCacheService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
  exports: [AuthService, PermissionCacheService],
})
export class AuthModule {}

  