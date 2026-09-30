import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomerCompanyUserEntity } from '../entity/customer-company-user.entity';
import { AddressEntity } from '../entity/address.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CustomerCompanyUserListService {
  constructor(
    private readonly general: GeneralUtilities,
    @InjectRepository(CustomerCompanyUserEntity)
    private readonly customerCompanyUserRepo: Repository<CustomerCompanyUserEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
  ) {}

  async startCustomerCompanyUserDetails(req: any, params: any) {
    const response = await this.getCustomerCompanyUserDetails(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getCustomerCompanyUserDetails(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Customer Company User ID is required');
      }

      const queryBuilder =
        this.customerCompanyUserRepo.createQueryBuilder('ccu');

      queryBuilder.select([
        'ccu.id AS id',
        'ccu.companyId AS companyId',
        'ccu.customerCompanyId AS customerCompanyId',
        'ccu.code AS code',
        'ccu.firstName AS firstName',
        'ccu.lastName AS lastName',
        'ccu.email AS email',
        'ccu.profileImage AS profileImage',
        'ccu.dob AS dob',
        'ccu.customDate AS customDate',
        'ccu.isOwner AS isOwner',
        'ccu.phoneCode AS phoneCode',
        'ccu.phoneNumber AS phoneNumber',
        'ccu.altPhoneCode AS altPhoneCode',
        'ccu.altPhoneNumber AS altPhoneNumber',
        'ccu.status AS status',
        'ccu.addedDate AS addedDate',
        'ccu.updatedDate AS updatedDate',
        'ccu.addedBy AS addedBy',
        'ccu.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('customerCompany.name', 'customerCompanyName');
      queryBuilder.leftJoin(
        'customer_company',
        'customerCompany',
        'customerCompany.id = ccu.customerCompanyId',
      );

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin(
        'company',
        'company',
        'company.id = ccu.companyId',
      );

      queryBuilder.leftJoin(
        'users',
        'addedByUser',
        'addedByUser.id = ccu.addedBy',
      );
      queryBuilder.leftJoin(
        'users',
        'updatedByUser',
        'updatedByUser.id = ccu.updatedBy',
      );

      queryBuilder.addSelect(
        "CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)",
        'addedByName',
      );
      queryBuilder.addSelect(
        "CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)",
        'updatedByName',
      );

      queryBuilder.where('ccu.id = :id', { id: params.id });
      queryBuilder.andWhere('ccu.sysRecDeleted = 0');

      const user = await queryBuilder.getRawOne();

      if (!user) {
        throw new Error('Customer Company User not found');
      }

      this.general.assertCompanyAccess(
        req,
        user.companyId,
        'view',
        'customer company user',
      );

      user.addedDateFormatted = await this.general.dateFormat(
        user.addedDate,
      );
      if (user.updatedDate) {
        user.updatedDateFormatted = await this.general.dateFormat(
          user.updatedDate,
        );
      }
      if (user.dob) {
        user.dobFormatted = await this.general.dateFormat(user.dob, false);
      }
      if (user.customDate) {
        user.customDateFormatted = await this.general.dateFormat(
          user.customDate,
          false,
        );
      }

      if (user.profileImage) {
        user.profileImageUrl = await this.general.generateUrl(
          'customer-company-user',
          `${user.id}`,
          user.profileImage,
        );
      }

      const address = await this.addressRepo.findOne({
        where: {
          entityId: params.id,
          entityType: 'CUSTOMER_COMPANY_USER',
          sysRecDeleted: false,
        },
      });
      user.address = address || null;

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: user,
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startCustomerCompanyUserList(req: any, params: any) {
    const response = await this.getCustomerCompanyUserList(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getCustomerCompanyUserList(req: any, params: any) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder =
        this.customerCompanyUserRepo.createQueryBuilder('ccu');

      queryBuilder.select([
        'ccu.id AS id',
        'ccu.companyId AS companyId',
        'ccu.customerCompanyId AS customerCompanyId',
        'ccu.code AS code',
        'ccu.firstName AS firstName',
        'ccu.lastName AS lastName',
        'ccu.email AS email',
        'ccu.profileImage AS profileImage',
        'ccu.dob AS dob',
        'ccu.customDate AS customDate',
        'ccu.isOwner AS isOwner',
        'ccu.phoneCode AS phoneCode',
        'ccu.phoneNumber AS phoneNumber',
        'ccu.altPhoneCode AS altPhoneCode',
        'ccu.altPhoneNumber AS altPhoneNumber',
        'ccu.status AS status',
        'ccu.addedDate AS addedDate',
        'ccu.updatedDate AS updatedDate',
        'ccu.addedBy AS addedBy',
        'ccu.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('customerCompany.name', 'customerCompanyName');
      queryBuilder.leftJoin(
        'customer_company',
        'customerCompany',
        'customerCompany.id = ccu.customerCompanyId',
      );

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin(
        'company',
        'company',
        'company.id = ccu.companyId',
      );

      queryBuilder.leftJoin(
        'users',
        'addedByUser',
        'addedByUser.id = ccu.addedBy',
      );
      queryBuilder.leftJoin(
        'users',
        'updatedByUser',
        'updatedByUser.id = ccu.updatedBy',
      );

      queryBuilder.addSelect(
        "CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)",
        'addedByName',
      );
      queryBuilder.addSelect(
        "CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)",
        'updatedByName',
      );

      queryBuilder.andWhere('ccu.sysRecDeleted = 0');

      if (params.customerCompanyId) {
        queryBuilder.andWhere(
          'ccu.customerCompanyId = :customerCompanyId',
          { customerCompanyId: params.customerCompanyId },
        );
      }

      this.general.applyCompanyScope(queryBuilder, req, 'ccu');

      await this.general.applyListQuery(queryBuilder, params, 'ccu.firstName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      for (const item of data) {
        if (item.dob) {
          item.dobFormatted = await this.general.dateFormat(item.dob, false);
        }
        if (item.customDate) {
          item.customDateFormatted = await this.general.dateFormat(
            item.customDate,
            false,
          );
        }
        if (item.profileImage) {
          item.profileImageUrl = await this.general.generateUrl(
            'customer-company-user',
            `${item.id}`,
            item.profileImage,
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
        message: 'Customer Company User list fetched successfully',
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
