import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from '../entity/company.entity';
import { CompanyCurrencyEntity } from '../entity/company-currency.entity';
import { CurrencyEntity } from '../../currency/entity/currency.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { In } from 'typeorm';

@Injectable()
export class CompanyListService {
  constructor(private readonly general: GeneralUtilities) { }

  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;

  @InjectRepository(CompanyCurrencyEntity)
  private companyCurrencyRepo: Repository<CompanyCurrencyEntity>;

  @InjectRepository(CurrencyEntity)
  private currencyRepo: Repository<CurrencyEntity>;

  async startCompanyDetails(req, params) {
    const response = await this.getCompanyDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getCompanyDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Company ID is required');
      }

      const queryBuilder = this.companyRepo.createQueryBuilder('company');

      queryBuilder.select([
        'company.id AS id',
        'company.companyCode AS companyCode',
        'company.companyName AS companyName',
        'company.shortName AS shortName',
        'company.email AS email',
        'company.phone AS phone',
        'company.contactPersonName AS contactPersonName',
        'company.companyLogo AS companyLogo',
        'company.status AS status',
        'company.parentCompanyId AS parentCompanyId',
        'company.addedDate AS addedDate',
        'company.updatedDate AS updatedDate',
        'company.addedBy AS addedBy',
        'company.updatedBy AS updatedBy',
        'company.legalName AS legalName',
        'company.registrationNumber AS registrationNumber',
        'company.taxNumber AS taxNumber',
        'company.website AS website',
        'company.dialCode AS dialCode',
        'company.addressLine1 AS addressLine1',
        'company.addressLine2 AS addressLine2',
        'company.city AS city',
        'company.state AS state',
        'company.country AS country',
        'company.zipCode AS zipCode',
      ]);

      queryBuilder.addSelect('parent.companyName', 'parentCompanyName');
      queryBuilder.leftJoin('company', 'parent', 'parent.id = company.parentCompanyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = company.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = company.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.addSelect("CONCAT(company.dialCode, ' ', company.phone)", 'fullPhoneNumber');

      queryBuilder.where('company.id = :id', { id: params.id });
      queryBuilder.andWhere('company.sysRecDeleted = 0');

      const company = await queryBuilder.getRawOne();

      if (!company) {
        throw new Error('Company not found');
      }

      if (!this.general.isSuperAdmin(req) && company.id !== req.user.companyId && company.parentCompanyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot view company outside your company hierarchy');
      }

      company.addedDateFormatted = await this.general.dateFormat(
        company.addedDate,
      );

      if (company.updatedDate) {
        company.updatedDateFormatted = await this.general.dateFormat(
          company.updatedDate,
        );
      }


      if (company.companyLogo) {
        company['logoUrl'] = await this.general.generateUrl(
          'company',
          `${company.id}`,
          company.companyLogo,
        );
      }

      const currenciesRaw = await this.currencyRepo.createQueryBuilder('currency')
        .innerJoin(CompanyCurrencyEntity, 'cc', 'cc.currencyCode = currency.currencyCode')
        .where('cc.companyId = :companyId', { companyId: company.id })
        .getMany();

      if (currenciesRaw.length > 0) {
        company['supportedCurrencies'] = currenciesRaw.map(c => c.currencyCode);
        company['currencies'] = currenciesRaw;
      } else {
        company['supportedCurrencies'] = [];
        company['currencies'] = [];
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: company,
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

  async startCompanyList(req, params) {
    const response = await this.getCompanyList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getCompanyList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.companyRepo.createQueryBuilder('company');

      queryBuilder.select([
        'company.id  AS id',
        'company.companyCode  AS companyCode',
        'company.companyName  AS companyName',
        'company.shortName  AS shortName',
        'company.email  AS email',
        'company.phone  AS phone',
        'company.contactPersonName AS contactPersonName',
        'company.companyLogo  AS companyLogo',
        'company.status AS status',
        'company.parentCompanyId AS parentCompanyId',
        'company.addedDate AS addedDate',
        'company.updatedDate AS updatedDate',
        'company.addedBy AS addedBy',
        'company.updatedBy AS updatedBy',
        'company.legalName AS legalName',
        'company.registrationNumber AS registrationNumber',
        'company.taxNumber AS taxNumber',
        'company.website AS website',
        'company.dialCode AS dialCode',
        'company.addressLine1 AS addressLine1',
        'company.addressLine2 AS addressLine2',
        'company.city AS city',
        'company.state AS state',
        'company.country AS country',
        'company.zipCode AS zipCode',
      ]);

      queryBuilder.addSelect('parent.companyName', 'parentCompanyName');
      queryBuilder.leftJoin('company', 'parent', 'parent.id = company.parentCompanyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = company.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = company.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.addSelect("CONCAT(company.dialCode, ' ', company.phone)", 'fullPhoneNumber');

      queryBuilder.andWhere('company.sysRecDeleted = 0');

      if (!this.general.isSuperAdmin(req)) {
        queryBuilder.andWhere(
          '(company.id = :scopedCompanyId OR company.parentCompanyId = :scopedCompanyId)',
          { scopedCompanyId: req.user.companyId }
        );
      }

      await this.general.applyListQuery(queryBuilder, params, 'company.companyName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const companyIds = data.map(c => c.id);
      let allMappings: CompanyCurrencyEntity[] = [];
      let allCurrencies: CurrencyEntity[] = [];

      if (companyIds.length > 0) {
        allMappings = await this.companyCurrencyRepo.find({
          where: { companyId: In(companyIds) }
        });

        const currencyCodes = Array.from(new Set(allMappings.map(m => m.currencyCode)));
        if (currencyCodes.length > 0) {
          allCurrencies = await this.currencyRepo.find({
            where: { currencyCode: In(currencyCodes) }
          });
        }
      }

      for (const company of data) {
        if (company.companyLogo) {
          company.logoUrl = await this.general.generateUrl(
            'company',
            `${company.id}`,
            company.companyLogo,
          );
        }

        const companyMappings = allMappings.filter(m => m.companyId === company.id);
        if (companyMappings.length > 0) {
          const cCodes = companyMappings.map(m => m.currencyCode);
          company.currencies = allCurrencies.filter(c => cCodes.includes(c.currencyCode));
        } else {
          company.currencies = [];
        }
      }

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Company List fetched successfully',
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

  async finishFailure(params) {
    const output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message,
        data: params?.data ? params?.data : [],
      },
    };

    return output;
  }
}


