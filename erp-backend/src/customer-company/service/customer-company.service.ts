import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomerCompanyEntity } from '../entity/customer-company.entity';
import { AddressEntity } from '../entity/address.entity';
import { CustomerCompanyUserEntity } from '../entity/customer-company-user.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { Status } from 'src/package/common/enums/enum';

@Injectable()
export class CustomerCompanyService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
    @InjectRepository(CustomerCompanyEntity)
    private readonly customerCompanyRepo: Repository<CustomerCompanyEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
    @InjectRepository(CustomerCompanyUserEntity)
    private readonly customerCompanyUserRepo: Repository<CustomerCompanyUserEntity>,
  ) {}

  async startInsertCustomerCompany(req: any, params: any) {
    const response = await this.insertCustomerCompany(req, params);

    if (response.success === 1) {
      const insertId = response?.data?.insert_id;
      const ownerInsertId = response?.owner_insert_id;

      if (params.logo && insertId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.logo,
          insertId,
          'customer-company',
        );

        if (fileResponse.success === 0) {
          await this.customerCompanyRepo.delete({ id: insertId });
          await this.addressRepo.delete({
            entityId: insertId,
            entityType: 'CUSTOMER_COMPANY',
          });
          if (ownerInsertId) {
            await this.customerCompanyUserRepo.delete({ id: ownerInsertId });
          }
          return await this.finishFailure({
            success: 0,
            message:
              'Customer Company created but logo transfer failed. Transaction rolled back.',
          });
        }
      }

      if (params.owner && params.owner.profileImage && ownerInsertId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.owner.profileImage,
          ownerInsertId,
          'customer-company-user',
        );

        if (fileResponse.success === 0) {
          await this.customerCompanyRepo.delete({ id: insertId });
          await this.addressRepo.delete({
            entityId: insertId,
            entityType: 'CUSTOMER_COMPANY',
          });
          await this.customerCompanyUserRepo.delete({ id: ownerInsertId });
          return await this.finishFailure({
            success: 0,
            message:
              'Customer Company created but owner profile image transfer failed. Transaction rolled back.',
          });
        }
      }

      return await this.finishSuccess(response, params);
    }

    if (params.logo) {
      await this.commonFileService.deleteTempFile(params.logo);
    }
    if (params.owner && params.owner.profileImage) {
      await this.commonFileService.deleteTempFile(params.owner.profileImage);
    }

    return await this.finishFailure(response);
  }

  async insertCustomerCompany(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.code) {
        const codeExists = await this.customerCompanyRepo.findOne({
          where: {
            code: params.code,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Customer Company Code already exists');
        }
      }

      if (params.name) {
        const nameExists = await this.customerCompanyRepo.findOne({
          where: {
            name: params.name,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Customer Company Name already exists');
        }
      }

      if (params.status && !Object.values(Status).includes(params.status)) {
        throw new Error('Invalid status value provided');
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
        if (key !== 'address' && params[key] !== undefined) {
          addressData[key] = params[key];
        }
      });

      const { address: _extractedAddress, owner: _extractedOwner, ...dbInsertData } = params as any;
      addressKeys.forEach((key) => delete dbInsertData[key]);

      Object.keys(dbInsertData).forEach((key) => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';
      if (!dbInsertData.status) {
        dbInsertData.status = Status.Active;
      }

      const res = await this.customerCompanyRepo.insert(dbInsertData);
      const insertId = res?.raw?.insertId;

      const hasAddressValues = Object.values(addressData).some(
        (val) => val !== undefined && val !== null && val !== '',
      );

      if (hasAddressValues) {
        await this.addressRepo.insert({
          entityId: insertId,
          entityType: 'CUSTOMER_COMPANY',
          companyId: params.companyId,
          ...addressData,
        });
      }

      let ownerInsertId = null;
      if (params.owner && typeof params.owner === 'object') {
        const ownerData = { ...params.owner };
        ownerData.customerCompanyId = insertId;
        ownerData.companyId = params.companyId;
        ownerData.isOwner = true;
        ownerData.addedBy = req.user?.sub;
        ownerData.addedDate = () => 'NOW()';
        if (!ownerData.status) ownerData.status = Status.Active;

        delete ownerData.id;

        const ownerRes = await this.customerCompanyUserRepo.insert(ownerData);
        ownerInsertId = ownerRes?.raw?.insertId;
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CUSTOMER_COMPANY_CREATE',
        'CUSTOMER_COMPANY',
        insertId,
        params.name,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Customer Company Added Successfully.',
        data: {
          insert_id: insertId,
        },
        owner_insert_id: ownerInsertId,
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

  async startUpdateCustomerCompany(req: any, params: any) {
    const response = await this.updateCustomerCompany(req, params);

    if (response.success === 1) {
      if (params.logo && params.id) {
        const fileResponse = await this.commonFileService.transferFile(
          params.logo,
          params.id,
          'customer-company',
        );

        if (fileResponse.success === 0) {
          return await this.finishFailure({
            success: 0,
            message: 'Customer Company updated but logo transfer failed.',
          });
        }
      }

      const ownerId = response?.owner_id;
      if (params.owner && params.owner.profileImage && ownerId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.owner.profileImage,
          ownerId,
          'customer-company-user',
        );

        if (fileResponse.success === 0) {
          return await this.finishFailure({
            success: 0,
            message: 'Customer Company updated but owner profile image transfer failed.',
          });
        }
      }

      return await this.finishSuccess(response);
    }

    if (params.logo) {
      await this.commonFileService.deleteTempFile(params.logo);
    }
    if (params.owner && params.owner.profileImage) {
      await this.commonFileService.deleteTempFile(params.owner.profileImage);
    }

    return await this.finishFailure(response);
  }

  async updateCustomerCompany(req: any, params: any) {
    let return_data: any = {};
    console.log('updateCustomerCompany params:', params);
    try {
      if (!params.id) {
        throw new Error('Customer Company ID is required');
      }

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      }

      const existingCompany = await this.customerCompanyRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingCompany) {
        throw new Error('Customer Company not found');
      }

      this.general.assertCompanyAccess(
        req,
        existingCompany.companyId,
        'update',
        'customer company',
      );

      if (params.code && params.code !== existingCompany.code) {
        const codeExists = await this.customerCompanyRepo.findOne({
          where: {
            code: params.code,
            companyId: existingCompany.companyId,
            sysRecDeleted: false,
          },
        });
        if (codeExists) {
          throw new Error('Customer Company Code already exists');
        }
      }

      if (params.name && params.name !== existingCompany.name) {
        const nameExists = await this.customerCompanyRepo.findOne({
          where: {
            name: params.name,
            companyId: existingCompany.companyId,
            sysRecDeleted: false,
          },
        });
        if (nameExists) {
          throw new Error('Customer Company Name already exists');
        }
      }

      if (params.status && !Object.values(Status).includes(params.status)) {
        throw new Error('Invalid status value provided');
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
        if (key !== 'address' && params[key] !== undefined) {
          addressData[key] = params[key];
        }
      });

      const { id: _extractedId, address: _extractedAddress, owner: _extractedOwner, ...dbUpdateData } =
        params as any;
      addressKeys.forEach((key) => delete dbUpdateData[key]);

      Object.keys(dbUpdateData).forEach((key) => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.customerCompanyRepo.update(
        { id: params.id },
        dbUpdateData,
      );

      const existingAddress = await this.addressRepo.findOne({
        where: {
          entityId: params.id,
          entityType: 'CUSTOMER_COMPANY',
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
          entityType: 'CUSTOMER_COMPANY',
          companyId: existingCompany.companyId,
          ...addressData,
        });
      }

      let ownerId: number | null = null;
      if (params.owner && typeof params.owner === 'object') {
        ownerId = params.owner.id;
        const ownerData = { ...params.owner };
        delete ownerData.id;
        ownerData.updatedBy = req.user?.sub;
        ownerData.updatedDate = () => 'NOW()';

        if (!ownerId) {
          const existingOwner = await this.customerCompanyUserRepo.findOne({
            where: {
              customerCompanyId: params.id,
              isOwner: true,
              sysRecDeleted: false,
            },
          });
          if (existingOwner) {
            ownerId = existingOwner.id;
          }
        }

        if (ownerId) {
          await this.customerCompanyUserRepo.update({ id: ownerId }, ownerData);
        } else {
          ownerData.customerCompanyId = params.id;
          ownerData.companyId = existingCompany.companyId;
          ownerData.isOwner = true;
          ownerData.addedBy = req.user?.sub;
          ownerData.addedDate = () => 'NOW()';
          if (!ownerData.status) ownerData.status = Status.Active;
          const ownerRes = await this.customerCompanyUserRepo.insert(ownerData);
          ownerId = ownerRes?.raw?.insertId;
        }
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CUSTOMER_COMPANY_UPDATE',
        'CUSTOMER_COMPANY',
        params.id,
        params.name || existingCompany.name,
        existingCompany.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Customer Company Updated Successfully.',
        data: { affected: res.affected },
        owner_id: ownerId,
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startDeleteCustomerCompany(req: any, params: any) {
    const response = await this.deleteCustomerCompany(req, params);

    if (response.success === 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteCustomerCompany(req: any, params: any) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Customer Company ID is required');
      }

      const existingCompany = await this.customerCompanyRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingCompany) {
        throw new Error('Customer Company not found');
      }

      this.general.assertCompanyAccess(
        req,
        existingCompany.companyId,
        'delete',
        'customer company',
      );

      const payload = this.general.buildSoftDeletePayload(
        { code: existingCompany.code, name: existingCompany.name },
        req,
      );
      const res = await this.customerCompanyRepo.update(
        { id: params.id },
        payload,
      );

      await this.addressRepo.update(
        { entityId: params.id, entityType: 'CUSTOMER_COMPANY' },
        { sysRecDeleted: true },
      );

      await this.customerCompanyUserRepo.update(
        { customerCompanyId: params.id },
        { sysRecDeleted: true },
      );

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CUSTOMER_COMPANY_DELETE',
        'CUSTOMER_COMPANY',
        params.id,
        existingCompany.name,
        existingCompany.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Customer Company Deleted Successfully.',
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
