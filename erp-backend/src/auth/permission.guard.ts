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

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(GroupCapabilityEntity)
    private readonly groupCapabilityRepo: Repository<GroupCapabilityEntity>,
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

    // Attach user.companyId explicitly to request.user.companyId as required
    request.user.companyId = user.companyId;

    // Bypass check if user is a Super Admin
    // user.isSuperAdmin can be checking both numeric/boolean values safely
    if (user.isSuperAdmin === 1 || user.isSuperAdmin === true) {
      return true;
    }

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

    const userPermissions = mappings
      .map((m) => m.capability?.capabilityCode)
      .filter(Boolean);

    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
