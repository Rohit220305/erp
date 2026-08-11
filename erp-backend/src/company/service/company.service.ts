import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from '../entity/company.entity';
import { CompanyCurrencyEntity } from '../entity/company-currency.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
  ) { }
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
      this.general.assertCompanyAccess(req, params.parentCompanyId, 'create', 'child company');

      const [companyCodeExists, parentCompany] = await Promise.all([
        this.companyRepo.findOne({
          where: { companyCode: params.companyCode, sysRecDeleted: false },
        }),
        params.parentCompanyId && params.parentCompanyId > 0
          ? this.companyRepo.findOne({
              where: { id: params.parentCompanyId, sysRecDeleted: false },
            })
          : Promise.resolve(null),
      ]);

      if (companyCodeExists) {
        throw new Error('Company Code already exists');
      }

      if (params.parentCompanyId && params.parentCompanyId > 0 && !parentCompany) {
        throw new Error('Parent Company not found');
      }

      const {
        supportedCurrencies: _extractedSupportedCurrencies,
        companyLogo: _extractedCompanyLogo,
        ...dbInsertData
      } = params;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.companyRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'COMPANY_CREATE',
        'COMPANY',
        res?.raw?.insertId,
        params.companyName,
        res?.raw?.insertId,
      );
      await this.activityLogService.log(logPayload);

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
          sysRecDeleted: false,
        },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      if (!this.general.isSuperAdmin(req) && company.id !== req.user.companyId && company.parentCompanyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot update company outside your company hierarchy');
      }

      if (params.companyCode && params.companyCode !== company.companyCode) {
        const codeExists = await this.companyRepo.findOne({
          where: {
            companyCode: params.companyCode,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Company Code already exists');
        }
      }

      if (params.parentCompanyId && params.parentCompanyId == params.id) {
        throw new Error('Parent Company cannot be same as Company');
      }

      const {
        id: _extractedId,
        supportedCurrencies: _extractedSupportedCurrencies,
        companyLogo: _extractedCompanyLogo,
        ...dbUpdateData
      } = params;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.companyRepo.update(
        { id: params.id },
        dbUpdateData,
      );

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'COMPANY_UPDATE',
        'COMPANY',
        params.id,
        params.companyName || company.companyName,
        params.id,
      );
      await this.activityLogService.log(logPayload);

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
          sysRecDeleted: false,
        },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      if (!this.general.isSuperAdmin(req) && company.id !== req.user.companyId && company.parentCompanyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot delete company outside your company hierarchy');
      }

      const childCompanies = await this.companyRepo.count({
        where: {
          parentCompanyId: params.id,
          sysRecDeleted: false,
        },
      });

      if (childCompanies > 0) {
        throw new Error('Child companies exist. Cannot delete company.');
      }

      const payload = this.general.buildSoftDeletePayload(
        { companyCode: company.companyCode, email: company.email || null },
        req,
      );
      const res = await this.companyRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'COMPANY_DELETE',
        'COMPANY',
        params.id,
        company.companyName,
        params.id,
      );
      await this.activityLogService.log(logPayload);

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

  async finishFailure(params, incomingData?) {
    let output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message,
        data: params?.data ? params.data : [],
      },
    };

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }
}
