import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PackageEntity } from '../entity/package.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CompanyEntity } from 'src/company/entity/company.entity';

@Injectable()
export class PackageListService {
  constructor(private readonly general: GeneralUtilities) { }

  @InjectRepository(PackageEntity)
  private packageRepo: Repository<PackageEntity>;

  async startPackageDetails(req, params) {
    const response = await this.getPackageDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getPackageDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Package ID is required');
      }

      const queryBuilder = this.packageRepo.createQueryBuilder('package');

      queryBuilder.select([
        'package.id AS id',
        'package.packageCode AS packageCode',
        'package.packageName AS packageName',
        'package.abbreviation AS abbreviation',
        'package.description AS description',
        'package.status AS status',
        'package.companyId AS companyId',
        'package.addedDate AS addedDate',
        'package.updatedDate AS updatedDate',
        'package.addedBy AS addedBy',
        'package.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin(CompanyEntity, 'company', 'company.id = package.companyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = package.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = package.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('package.id = :id', { id: params.id });
      queryBuilder.andWhere('package.sysRecDeleted = 0');

      const pkg = await queryBuilder.getRawOne();

      if (!pkg) {
        throw new Error('Package not found');
      }

      this.general.assertCompanyAccess(req, pkg.companyId, 'view', 'package');

      pkg.addedDateFormatted = await this.general.dateFormat(
        pkg.addedDate,
      );

      if (pkg.updatedDate) {
        pkg.updatedDateFormatted = await this.general.dateFormat(
          pkg.updatedDate,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: pkg,
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

  async startPackageList(req, params) {
    const response = await this.getPackageList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getPackageList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.packageRepo.createQueryBuilder('package');

      queryBuilder.select([
        'package.id AS id',
        'package.packageCode AS packageCode',
        'package.packageName AS packageName',
        'package.abbreviation AS abbreviation',
        'package.description AS description',
        'package.status AS status',
        'package.companyId AS companyId',
        'package.addedDate AS addedDate',
        'package.updatedDate AS updatedDate',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin(CompanyEntity, 'company', 'company.id = package.companyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = package.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = package.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('package.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'package');

      await this.general.applyListQuery(queryBuilder, params, 'package.packageName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Package List fetched successfully',
        data: {
          list: data,
          pagination,
        },
      };
    } catch (err) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async finishSuccess(params) {
    const output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params?.data : [],
      },
    };

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
