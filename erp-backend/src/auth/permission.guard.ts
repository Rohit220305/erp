import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupCapabilityEntity } from 'src/capability/entity/group-capability.entity';
import { REQUIRE_PERMISSION_KEY } from 'src/package/decorator/require-permission.decorator';
import { PermissionCacheService } from './permission.cache.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(GroupCapabilityEntity)
    private readonly groupCapabilityRepo: Repository<GroupCapabilityEntity>,
    private readonly permissionCacheService: PermissionCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    request.user.companyId = user.companyId;

    if (user.isSuperAdmin === 1 || user.isSuperAdmin === true) {
      return true;
    }


    if (
      request.path === '/user/get-user' &&
      request.method === 'GET' &&
      String(request.query.id) === String(user.sub)
    ) {
      return true;
    }
    const cached = await this.permissionCacheService.getPermissions(
      user.groupId,
    );
    let userPermissions: string[] = [];

    if (cached !== null) {
      userPermissions = cached;
    } else {
      const mappings = await this.groupCapabilityRepo.find({
        where: {
          groupId: user.groupId,
          status: 'Active',
          capability: {
            status: 'Active',
          },
        },
        relations: { capability: true },
      });

      userPermissions = mappings
        .map((m) => m.capability?.capabilityCode)
        .filter(Boolean)
        .map((code) => {
          if (code.endsWith('_ADD')) return code.replace('_ADD', '_CREATE');
          if (code.endsWith('_EDIT')) return code.replace('_EDIT', '_UPDATE');
          return code;
        });

      await this.permissionCacheService.setPermissions(
        user.groupId,
        userPermissions,
      );
    }

    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}

