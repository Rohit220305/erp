import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from '../entity/company.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { COMPANY_INSERT_FIELDS, COMPANY_UPDATE_FIELDS } from 'src/package/constants/company-fields.constant';
import { CommonFileService } from 'src/package/service/common-file.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
  ) {}
  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;



  async startInsertCompany(req, params) {
    const response = await this.insertCompany(params);

    if (response.success == 1) {
      const insertId = response?.data?.insert_id;

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
  async insertCompany(params) {
    let return_data: any = {};

    try {
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

      queryColumns.addedDate = () => 'NOW()';

      const res = await this.companyRepo.insert(queryColumns);

      return_data = {
        success: 1,
        message: 'Company Added Successfully.',
        data: {
          insert_id: res?.raw?.insertId,
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



  async startUpdateCompany(req, params) {
    const response = await this.updateCompany(params);

    if (response.success == 1) {
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

  async updateCompany(params) {
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

      queryColumns.updatedDate = () => 'NOW()';

      const res = await this.companyRepo.update(
        { id: params.id },
        queryColumns,
      );

      return_data = {
        success: 1,
        message: 'Company Updated Successfully.',
        data: {
          affected: res.affected,
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

  async startDeleteCompany(req, params) {
    const response = await this.deleteCompany(params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteCompany(params) {
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

      const childCompanies = await this.companyRepo.count({
        where: {
          parentCompanyId: params.id,
        },
      });

      if (childCompanies > 0) {
        throw new Error('Child companies exist. Cannot delete company.');
      }

      const res = await this.companyRepo.delete({
        id: params.id,
      });

      await this.commonFileService.deleteFolder('company', `${params.id}`);

      return_data = {
        success: 1,
        message: 'Company Deleted Successfully.',
        data: {
          affected: res.affected,
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
