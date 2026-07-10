import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from '../entity/company.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CompanyListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;

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

      const company = await this.companyRepo.findOne({
        where: {
          id: params.id,
        },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      // Scoping Check
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin && company.id !== req.user.companyId && company.parentCompanyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot view company outside your company hierarchy');
      }

      company['addedDateFormatted'] = await this.general.dateFormat(
        company.addedDate,
      );

      if (company.updatedDate) {
        company['updatedDateFormatted'] = await this.general.dateFormat(
          company.updatedDate,
        );
      }


      if (company.parentCompanyId && company.parentCompanyId > 0) {
        const parentCompany = await this.companyRepo.findOne({
          where: {
            id: company.parentCompanyId,
          },
        });

        if (parentCompany) {
          company['parentCompanyName'] = parentCompany.companyName;
        }
      }


      if (company.companyLogo) {
        company['logoUrl'] = await this.general.generateUrl(
          'company',
          `${company.id}`,
          company.companyLogo,
        );
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
      const page = params.page ? parseInt(params.page) : 1;

      const limit = params.limit ? parseInt(params.limit) : 10;

      const skip = (page - 1) * limit;

      const queryBuilder = this.companyRepo.createQueryBuilder('company');

      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        queryBuilder.andWhere(
          '(company.id = :scopedCompanyId OR company.parentCompanyId = :scopedCompanyId)',
          { scopedCompanyId: req.user.companyId }
        );
      }

      if (params?.search) {
        queryBuilder.andWhere(
          `
          (
            company.companyCode LIKE :search
            OR company.companyName LIKE :search
            OR company.email LIKE :search
          )
          `,
          {
            search: `%${params.search}%`,
          },
        );
      }


      const columnMap: Record<string, string> = {
        companyCode: 'company.companyCode',
        companyName: 'company.companyName',
        shortName: 'company.shortName',
        email: 'company.email',
        contactPersonName: 'company.contactPersonName',
        phone: 'company.phone',
        status: 'company.status',
        id: 'company.id',
        addedDateFormatted: 'company.addedDate',
      };

      if (params?.filters) {
        // console.log("DE BUG: params.filters =", JSON.stringify(params.filters));
        const whereString = await this.general.makeFilterString(
          params.filters,
          columnMap,
          params.logicalOperator
        );

        if (whereString) {
          queryBuilder.andWhere(whereString);
        }
      }

      /**
       * Sorting
       */
      if (params?.sortField && params?.sortOrder && columnMap[params.sortField]) {
        const order = params.sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(columnMap[params.sortField], order);
      } else {
        queryBuilder.orderBy('company.companyName', 'ASC');
      }

      queryBuilder.skip(skip);
      queryBuilder.take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();


      for (const company of data) {
        company['addedDateFormatted'] = await this.general.dateFormat(
          company.addedDate,
        );

        if (company.updatedDate) {
          company['updatedDateFormatted'] = await this.general.dateFormat(
            company.updatedDate,
          );
        }


        if (company.parentCompanyId && company.parentCompanyId > 0) {
          const parentCompany = await this.companyRepo.findOne({
            where: {
              id: company.parentCompanyId,
            },
          });

          company['parentCompanyName'] = parentCompany?.companyName || '';
        }


        if (company.companyLogo) {
          company['logoUrl'] = await this.general.generateUrl(
            'company',
            `${company.id}`,
            company.companyLogo,
          );
        }
      }

      return_data = {
        success: 1,
        message: 'Company List fetched successfully',
        data: {
          list: data,
          pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
            prevPage: page > 1,
            nextPage: total > skip + limit,
          },
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
    return params;
  }
}


