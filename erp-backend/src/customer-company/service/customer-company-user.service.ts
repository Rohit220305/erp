import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { CustomerCompanyUserEntity } from '../entity/customer-company-user.entity';
import { CustomerCompanyEntity } from '../entity/customer-company.entity';
import { AddressEntity } from '../entity/address.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { Status } from 'src/package/common/enums/enum';

@Injectable()
export class CustomerCompanyUserService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
    @InjectRepository(CustomerCompanyUserEntity)
    private readonly customerCompanyUserRepo: Repository<CustomerCompanyUserEntity>,
    @InjectRepository(CustomerCompanyEntity)
    private readonly customerCompanyRepo: Repository<CustomerCompanyEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
  ) {}

  async startInsertCustomerCompanyUser(req: any, params: any) {
    const response = await this.insertCustomerCompanyUser(req, params);

    if (response.success === 1) {
      const insertId = response?.data?.insert_id;

      if (params.profileImage && insertId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.profileImage,
          insertId,
          'customer-company-user',
        );

        if (fileResponse.success === 0) {
          await this.customerCompanyUserRepo.delete({ id: insertId });
          await this.addressRepo.delete({
            entityId: insertId,
            entityType: 'CUSTOMER_COMPANY_USER',
          });
          return await this.finishFailure({
            success: 0,
            message:
              'Customer Company User created but profile image transfer failed. Transaction rolled back.',
          });
        }
      }

      return await this.finishSuccess(response, params);
    }

    if (params.profileImage) {
      await this.commonFileService.deleteTempFile(params.profileImage);
    }

    return await this.finishFailure(response);
  }

  async insertCustomerCompanyUser(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (!params.customerCompanyId) {
        throw new Error('customerCompanyId is required');
      }

      const customerCompany = await this.customerCompanyRepo.findOne({
        where: { id: params.customerCompanyId, sysRecDeleted: false },
      });

      if (!customerCompany) {
        throw new Error('Customer Company not found');
      }

      this.general.assertCompanyAccess(
        req,
        customerCompany.companyId,
        'create user for',
        'customer company',
      );

      if (params.status && !Object.values(Status).includes(params.status)) {
        throw new Error('Invalid status value provided');
      }

      const isOwnerBool =
        params.isOwner === true ||
        params.isOwner === 1 ||
        params.isOwner === '1' ||
        params.isOwner === 'true';

      if (isOwnerBool) {
        const existingOwner = await this.customerCompanyUserRepo.findOne({
          where: {
            customerCompanyId: params.customerCompanyId,
            isOwner: true,
            sysRecDeleted: false,
          },
        });

        if (existingOwner) {
          throw new Error(
            'An owner already exists for this Customer Company',
          );
        }
      }

      const addressData: any = {};
      const addressKeys = [
        'address',
        'country',
        'state',
        'city',
        'zipCode',
        'phoneCode',
        'phoneNumber',
        'altPhoneCode',
        'altPhoneNumber',
      ];

      if (params.address && typeof params.address === 'object') {
        addressKeys.forEach((key) => {
          if (params.address[key] !== undefined) {
            addressData[key] = params.address[key];
          }
        });
      }
      addressKeys.forEach((key) => {
        if (params[key] !== undefined) {
          addressData[key] = params[key];
        }
      });

      const { address: _extractedAddress, ...dbInsertData } = params as any;
      addressKeys.forEach((key) => delete dbInsertData[key]);

      Object.keys(dbInsertData).forEach((key) => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.isOwner = isOwnerBool;
      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';
      if (!dbInsertData.status) {
        dbInsertData.status = Status.Active;
      }

      const res = await this.customerCompanyUserRepo.insert(dbInsertData);
      const insertId = res?.raw?.insertId;

      const hasAddressValues = Object.values(addressData).some(
        (val) => val !== undefined && val !== null && val !== '',
      );

      if (hasAddressValues) {
        await this.addressRepo.insert({
          entityId: insertId,
          entityType: 'CUSTOMER_COMPANY_USER',
          companyId: params.companyId,
          ...addressData,
        });
      }

      const fullName = `${params.firstName || ''} ${params.lastName || ''}`.trim();
      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CUSTOMER_COMPANY_USER_CREATE',
        'CUSTOMER_COMPANY_USER',
        insertId,
        fullName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Customer Company User Added Successfully.',
        data: {
          insert_id: insertId,
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

  async startUpdateCustomerCompanyUser(req: any, params: any) {
    const response = await this.updateCustomerCompanyUser(req, params);

    if (response.success === 1) {
      if (params.profileImage && params.id) {
        const fileResponse = await this.commonFileService.transferFile(
          params.profileImage,
          params.id,
          'customer-company-user',
        );

        if (fileResponse.success === 0) {
          return await this.finishFailure({
            success: 0,
            message: 'Customer Company User updated but profile image transfer failed.',
          });
        }
      }

      return await this.finishSuccess(response);
    }

    if (params.profileImage) {
      await this.commonFileService.deleteTempFile(params.profileImage);
    }

    return await this.finishFailure(response);
  }

  async updateCustomerCompanyUser(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Customer Company User ID is required');
      }

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      }

      const existingUser = await this.customerCompanyUserRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingUser) {
        throw new Error('Customer Company User not found');
      }

      this.general.assertCompanyAccess(
        req,
        existingUser.companyId,
        'update',
        'customer company user',
      );

      if (params.status && !Object.values(Status).includes(params.status)) {
        throw new Error('Invalid status value provided');
      }

      let isOwnerBool = existingUser.isOwner;
      if (params.isOwner !== undefined) {
        isOwnerBool =
          params.isOwner === true ||
          params.isOwner === 1 ||
          params.isOwner === '1' ||
          params.isOwner === 'true';

        if (isOwnerBool && !existingUser.isOwner) {
          const existingOwner = await this.customerCompanyUserRepo.findOne({
            where: {
              customerCompanyId: existingUser.customerCompanyId,
              isOwner: true,
              sysRecDeleted: false,
              id: Not(params.id),
            },
          });

          if (existingOwner) {
            throw new Error(
              'An owner already exists for this Customer Company',
            );
          }
        }
      }

      const addressData: any = {};
      const addressKeys = [
        'address',
        'country',
        'state',
        'city',
        'zipCode',
        'phoneCode',
        'phoneNumber',
        'altPhoneCode',
        'altPhoneNumber',
      ];

      if (params.address && typeof params.address === 'object') {
        addressKeys.forEach((key) => {
          if (params.address[key] !== undefined) {
            addressData[key] = params.address[key];
          }
        });
      }
      addressKeys.forEach((key) => {
        if (params[key] !== undefined) {
          addressData[key] = params[key];
        }
      });

      const { id: _extractedId, address: _extractedAddress, ...dbUpdateData } =
        params as any;
      addressKeys.forEach((key) => delete dbUpdateData[key]);

      Object.keys(dbUpdateData).forEach((key) => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.isOwner = isOwnerBool;
      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.customerCompanyUserRepo.update(
        { id: params.id },
        dbUpdateData,
      );

      const existingAddress = await this.addressRepo.findOne({
        where: {
          entityId: params.id,
          entityType: 'CUSTOMER_COMPANY_USER',
          sysRecDeleted: false,
        },
      });

      const hasAddressValues = Object.keys(addressData).length > 0;

      if (existingAddress) {
        if (hasAddressValues) {
          await this.addressRepo.update(
            { id: existingAddress.id },
            addressData,
          );
        }
      } else if (hasAddressValues) {
        await this.addressRepo.insert({
          entityId: params.id,
          entityType: 'CUSTOMER_COMPANY_USER',
          companyId: existingUser.companyId,
          ...addressData,
        });
      }

      const fullName = `${params.firstName || existingUser.firstName} ${params.lastName || existingUser.lastName}`.trim();
      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CUSTOMER_COMPANY_USER_UPDATE',
        'CUSTOMER_COMPANY_USER',
        params.id,
        fullName,
        existingUser.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Customer Company User Updated Successfully.',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startDeleteCustomerCompanyUser(req: any, params: any) {
    const response = await this.deleteCustomerCompanyUser(req, params);

    if (response.success === 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteCustomerCompanyUser(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Customer Company User ID is required');
      }

      const existingUser = await this.customerCompanyUserRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingUser) {
        throw new Error('Customer Company User not found');
      }

      this.general.assertCompanyAccess(
        req,
        existingUser.companyId,
        'delete',
        'customer company user',
      );

      const fullName = `${existingUser.firstName} ${existingUser.lastName}`.trim();
      const payload = this.general.buildSoftDeletePayload(
        { email: existingUser.email, name: fullName },
        req,
      );
      const res = await this.customerCompanyUserRepo.update(
        { id: params.id },
        payload,
      );

      await this.addressRepo.update(
        { entityId: params.id, entityType: 'CUSTOMER_COMPANY_USER' },
        { sysRecDeleted: true },
      );

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CUSTOMER_COMPANY_USER_DELETE',
        'CUSTOMER_COMPANY_USER',
        params.id,
        fullName,
        existingUser.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Customer Company User Deleted Successfully.',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async finishSuccess(params: any, incomingData?: any) {
    const output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
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
