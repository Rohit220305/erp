import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomerCompanyEntity } from '../entity/customer-company.entity';
import { AddressEntity } from '../entity/address.entity';
import { CustomerCompanyUserEntity } from '../entity/customer-company-user.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CustomerCompanyListService {
  constructor(
    private readonly general: GeneralUtilities,
    @InjectRepository(CustomerCompanyEntity)
    private readonly customerCompanyRepo: Repository<CustomerCompanyEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
    @InjectRepository(CustomerCompanyUserEntity)
    private readonly customerCompanyUserRepo: Repository<CustomerCompanyUserEntity>,
  ) {}

  async startCustomerCompanyDetails(req: any, params: any) {
    const response = await this.getCustomerCompanyDetails(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getCustomerCompanyDetails(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Customer Company ID is required');
      }

      const queryBuilder =
        this.customerCompanyRepo.createQueryBuilder('cc');

      queryBuilder.select([
        'cc.id AS id',
        'cc.companyId AS companyId',
        'cc.code AS code',
        'cc.name AS name',
        'cc.shortName AS shortName',
        'cc.logo AS logo',
        'cc.email AS email',
        'cc.incorporationDate AS incorporationDate',
        'cc.referenceCode AS referenceCode',
        'cc.remark AS remark',
        'cc.status AS status',
        'cc.addedDate AS addedDate',
        'cc.updatedDate AS updatedDate',
        'cc.addedBy AS addedBy',
        'cc.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin(
        'company',
        'company',
        'company.id = cc.companyId',
      );

      queryBuilder.leftJoin(
        'users',
        'addedByUser',
        'addedByUser.id = cc.addedBy',
      );
      queryBuilder.leftJoin(
        'users',
        'updatedByUser',
        'updatedByUser.id = cc.updatedBy',
      );

      queryBuilder.addSelect(
        "CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)",
        'addedByName',
      );
      queryBuilder.addSelect(
        "CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)",
        'updatedByName',
      );

      queryBuilder.where('cc.id = :id', { id: params.id });
      queryBuilder.andWhere('cc.sysRecDeleted = 0');

      const company = await queryBuilder.getRawOne();

      if (!company) {
        throw new Error('Customer Company not found');
      }

      this.general.assertCompanyAccess(
        req,
        company.companyId,
        'view',
        'customer company',
      );

      company.addedDateFormatted = await this.general.dateFormat(
        company.addedDate,
      );
      if (company.updatedDate) {
        company.updatedDateFormatted = await this.general.dateFormat(
          company.updatedDate,
        );
      }
      if (company.incorporationDate) {
        company.incorporationDateFormatted = await this.general.dateFormat(
          company.incorporationDate,
          false,
        );
      }

      if (company.logo) {
        company.logoUrl = await this.general.generateUrl(
          'customer-company',
          `${company.id}`,
          company.logo,
        );
      }

      const address = await this.addressRepo.findOne({
        where: {
          entityId: params.id,
          entityType: 'CUSTOMER_COMPANY',
          sysRecDeleted: false,
        },
      });
      company.address = address || null;

      const owner = await this.customerCompanyUserRepo.findOne({
        where: {
          customerCompanyId: params.id,
          isOwner: true,
          sysRecDeleted: false,
        },
      });

      if (owner && owner.profileImage) {
        (owner as any).profileImageUrl = await this.general.generateUrl(
          'customer-company-user',
          `${owner.id}`,
          owner.profileImage,
        );
      }

      company.owner = owner || null;

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: company,
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startCustomerCompanyList(req: any, params: any) {
    const response = await this.getCustomerCompanyList(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getCustomerCompanyList(req: any, params: any) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder =
        this.customerCompanyRepo.createQueryBuilder('cc');

      queryBuilder.select([
        'cc.id AS id',
        'cc.companyId AS companyId',
        'cc.code AS code',
        'cc.name AS name',
        'cc.shortName AS shortName',
        'cc.logo AS logo',
        'cc.email AS email',
        'cc.incorporationDate AS incorporationDate',
        'cc.referenceCode AS referenceCode',
        'cc.remark AS remark',
        'cc.status AS status',
        'cc.addedDate AS addedDate',
        'cc.updatedDate AS updatedDate',
        'cc.addedBy AS addedBy',
        'cc.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin(
        'company',
        'company',
        'company.id = cc.companyId',
      );

      queryBuilder.leftJoin(
        'users',
        'addedByUser',
        'addedByUser.id = cc.addedBy',
      );
      queryBuilder.leftJoin(
        'users',
        'updatedByUser',
        'updatedByUser.id = cc.updatedBy',
      );

      queryBuilder.addSelect(
        "CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)",
        'addedByName',
      );
      queryBuilder.addSelect(
        "CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)",
        'updatedByName',
      );

      queryBuilder.andWhere('cc.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'cc');

      await this.general.applyListQuery(queryBuilder, params, 'cc.name');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      for (const item of data) {
        if (item.incorporationDate) {
          item.incorporationDateFormatted = await this.general.dateFormat(
            item.incorporationDate,
            false,
          );
        }
        if (item.logo) {
          item.logoUrl = await this.general.generateUrl(
            'customer-company',
            `${item.id}`,
            item.logo,
          );
        }
      }

      const pagination = this.general.buildPaginationResponse(
        total,
        page,
        limit,
        skip,
      );

      return_data = {
        success: 1,
        message: 'Customer Company list fetched successfully',
        data: {
          list: data,
          pagination,
        },
      };
    } catch (err) {
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async finishSuccess(params: any) {
    return {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params?.data : [],
      },
    };
  }

  async finishFailure(params: any, incomingData?: any) {
    const output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'Something went wrong',
        data: params?.data ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }
}
