import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from '../entity/company.entity';
import { CompanyCurrencyEntity } from '../entity/company-currency.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { COMPANY_INSERT_FIELDS, COMPANY_UPDATE_FIELDS } from 'src/package/constants/company-fields.constant';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
  ) {}
  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;

  @InjectRepository(CompanyCurrencyEntity)
  private companyCurrencyRepo: Repository<CompanyCurrencyEntity>;



  async startInsertCompany(req, params) {
    const response = await this.insertCompany(req, params);

    if (response.success == 1) {
      const insertId = response?.data?.insert_id;

      if (params.supportedCurrencies && Array.isArray(params.supportedCurrencies)) {
        for (const currencyId of params.supportedCurrencies) {
          await this.companyCurrencyRepo.insert({
            companyId: insertId,
            currencyId,
            addedBy: req.user?.sub,
          });
        }
      }

      if (params.companyLogo && insertId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.companyLogo,
          insertId,
          'company',
        );


        if (fileResponse.success == 0) {
          await this.companyRepo.delete({
            id: insertId,
          });

          return await this.finishFailure({
            success: 0,
            message:
              'Company created but file transfer failed. Transaction rolled back.',
          });
        }
      }

      return await this.finishSuccess(response, params);
    }


    if (params.companyLogo) {
      await this.commonFileService.deleteTempFile(params.companyLogo);
    }

    return await this.finishFailure(response);
  }
  async insertCompany(req, params) {
    let return_data: any = {};

    try {
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        if (params.parentCompanyId !== req.user.companyId) {
          throw new ForbiddenException('Cannot create child company under a different parent company');
        }
      }

      const companyCodeExists = await this.companyRepo.findOne({
        where: {
          companyCode: params.companyCode,
        },
      });

      if (companyCodeExists) {
        throw new Error('Company Code already exists');
      }

      if (params.parentCompanyId && params.parentCompanyId > 0) {
        const parentCompany = await this.companyRepo.findOne({
          where: {
            id: params.parentCompanyId,
          },
        });

        if (!parentCompany) {
          throw new Error('Parent Company not found');
        }
      }

      const queryColumns = await this.general.mapFields(
        params,
        COMPANY_INSERT_FIELDS,
      );

      queryColumns.addedBy = req.user?.sub;
      queryColumns.addedDate = () => 'NOW()';

      const res = await this.companyRepo.insert(queryColumns);

      await this.activityLogService.log({
        activityCode: 'COMPANY_CREATE',
        companyId: res?.raw?.insertId,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId,
        entityType: 'COMPANY',
        entityId: res?.raw?.insertId,
        entityName: params.companyName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return_data = {
        success: 1,
        message: 'Company Added Successfully.',
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



  async startUpdateCompany(req, params) {
    
    const response = await this.updateCompany(req, params);

    if (response.success == 1) {
      if (params.supportedCurrencies && Array.isArray(params.supportedCurrencies)) {
        await this.companyCurrencyRepo.delete({ companyId: params.id });
        for (const currencyId of params.supportedCurrencies) {
          await this.companyCurrencyRepo.insert({
            companyId: params.id,
            currencyId,
            addedBy: req.user?.sub,
          });
        }
      }

      if (params.companyLogo && params.id) {
        const fileResponse = await this.commonFileService.transferFile(
          params.companyLogo,
          params.id,
          'company',
        );

        if (fileResponse.success == 0) {
          return await this.finishFailure({
            success: 0,
            message: 'Company updated but logo upload failed.',
          });
        }
      }

      return await this.finishSuccess(response);
    }

    if (params.companyLogo) {
      await this.commonFileService.deleteTempFile(params.companyLogo);
    }

    return await this.finishFailure(response);
  }

  async updateCompany(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Company ID is required');
      }

      const company = await this.companyRepo.findOne({
        where: {
          id: params.id,
        },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin && company.id !== req.user.companyId && company.parentCompanyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot update company outside your company hierarchy');
      }

      if (params.companyCode && params.companyCode !== company.companyCode) {
        const codeExists = await this.companyRepo.findOne({
          where: {
            companyCode: params.companyCode,
          },
        });

        if (codeExists) {
          throw new Error('Company Code already exists');
        }
      }

      if (params.parentCompanyId && params.parentCompanyId == params.id) {
        throw new Error('Parent Company cannot be same as Company');
      }

      const queryColumns = await this.general.mapFields(
        params,
        COMPANY_UPDATE_FIELDS,
      );

      queryColumns.updatedBy = req.user?.sub;
      queryColumns.updatedDate = () => 'NOW()';

      const res = await this.companyRepo.update(
        { id: params.id },
        queryColumns,
      );

      await this.activityLogService.log({
        activityCode: 'COMPANY_UPDATE',
        companyId: params.id,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId || undefined,
        entityType: 'COMPANY',
        entityId: params.id,
        entityName: params.companyName || company.companyName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return_data = {
        success: 1,
        message: 'Company Updated Successfully.',
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

  async startDeleteCompany(req, params) {
    const response = await this.deleteCompany(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteCompany(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Company ID is required');
      }

      const company = await this.companyRepo.findOne({
        where: {
          id: params.id,
        },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin && company.id !== req.user.companyId && company.parentCompanyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot delete company outside your company hierarchy');
      }

      const childCompanies = await this.companyRepo.count({
        where: {
          parentCompanyId: params.id,
        },
      });

      if (childCompanies > 0) {
        throw new Error('Child companies exist. Cannot delete company.');
      }

      await this.companyCurrencyRepo.delete({
        companyId: params.id,
      });

      const res = await this.companyRepo.delete({
        id: params.id,
      });

      await this.commonFileService.deleteFolder('company', `${params.id}`);

      await this.activityLogService.log({
        activityCode: 'COMPANY_DELETE',
        companyId: params.id,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId,
        entityType: 'COMPANY',
        entityId: params.id,
        entityName: company.companyName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return_data = {
        success: 1,
        message: 'Company Deleted Successfully.',
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

  async finishFailure(params) {
    return params;
  }
}
