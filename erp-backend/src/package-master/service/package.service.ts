import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PackageEntity } from '../entity/package.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class PackageService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
  ) { }

  @InjectRepository(PackageEntity)
  private packageRepo: Repository<PackageEntity>;

  async startInsertPackage(req, params) {
    const response = await this.insertPackage(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response, params);
    }

    return await this.finishFailure(response);
  }

  async insertPackage(req, params) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.packageCode) {
        const codeExists = await this.packageRepo.findOne({
          where: {
            packageCode: params.packageCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Package Code already exists');
        }
      }

      if (params.packageName) {
        const nameExists = await this.packageRepo.findOne({
          where: {
            packageName: params.packageName,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Package Name already exists');
        }
      }

      const {
        ...dbInsertData
      } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.packageRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PACKAGE_CREATE',
        'PACKAGE',
        res?.raw?.insertId,
        params.packageName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Package Added Successfully.',
        data: {
          insert_id: res?.raw?.insertId,
        },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startUpdatePackage(req, params) {
    const response = await this.updatePackage(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async updatePackage(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Package ID is required');
      }

      const pkg = await this.packageRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!pkg) {
        throw new Error('Package not found');
      }

      this.general.assertCompanyAccess(req, pkg.companyId, 'update', 'package');

      if (params.packageCode && params.packageCode !== pkg.packageCode) {
        const codeExists = await this.packageRepo.findOne({
          where: {
            packageCode: params.packageCode,
            companyId: pkg.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Package Code already exists');
        }
      }

      if (params.packageName && params.packageName !== pkg.packageName) {
        const nameExists = await this.packageRepo.findOne({
          where: {
            packageName: params.packageName,
            companyId: pkg.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Package Name already exists');
        }
      }

      const {
        id: _extractedId,
        ...dbUpdateData
      } = params as any;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.packageRepo.update({ id: params.id }, dbUpdateData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PACKAGE_UPDATE',
        'PACKAGE',
        params.id,
        params.packageName || pkg.packageName,
        pkg.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Package Updated Successfully.',
        data: {
          affected: res.affected,
        },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startDeletePackage(req, params) {
    const response = await this.deletePackage(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deletePackage(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Package ID is required');
      }

      const pkg = await this.packageRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!pkg) {
        throw new Error('Package not found');
      }

      this.general.assertCompanyAccess(req, pkg.companyId, 'delete', 'package');

      const payload = this.general.buildSoftDeletePayload(
        { packageCode: pkg.packageCode, packageName: pkg.packageName },
        req,
      );
      const res = await this.packageRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PACKAGE_DELETE',
        'PACKAGE',
        params.id,
        pkg.packageName,
        pkg.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Package Deleted Successfully.',
        data: {
          affected: res.affected,
        },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async finishSuccess(params, incomingData?) {
    let output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params.data : [],
      },
    };

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }

  async finishFailure(params: any, incomingData?: any) {
    let output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'Something went wrong',
        data: params?.data ? params.data : [],
      },
    };

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }
}
