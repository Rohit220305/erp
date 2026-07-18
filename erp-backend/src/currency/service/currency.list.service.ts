import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CurrencyEntity } from '../entity/currency.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CurrencyListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(CurrencyEntity)
  private currencyRepo: Repository<CurrencyEntity>;

  async startCurrencyDetails(req, params) {
    const response = await this.getCurrencyDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getCurrencyDetails(req, params) {
    let return_data: any = {};
    try {
      if (!params?.id) {
        throw new Error('Currency ID is required');
      }

      const currency = await this.currencyRepo.findOne({
        where: {
          id: params.id,
        },
      });
      if (!currency) {
        throw new Error('Currency not found');
      }

      currency['addedDateFormatted'] = await this.general.dateFormat(
        currency.createdAt,
      );

      if (currency.updatedAt) {
        currency['updatedDateFormatted'] = await this.general.dateFormat(
          currency.updatedAt,
        );
      }
        return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: currency,
      };
    } catch (err) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startCurrencyList(req, params) {
    const response = await this.getCurrencyList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getCurrencyList(req, params) {
    let return_data: any = {};

    try {
      const page = params?.page ? parseInt(params.page) : 1;

      const limit = params?.limit ? parseInt(params.limit) : 10;

      const skip = (page - 1) * limit;

      const queryBuilder = this.currencyRepo.createQueryBuilder('currency');

      if (params?.search) {
        queryBuilder.andWhere(
          `
          (
            currency.currencyCode LIKE :search
            OR currency.currencyName LIKE :search
            OR currency.currencySymbol LIKE :search
          )
          `,
          {
            search: `%${params.search}%`,
          },
        );
      }

      const columnMap: Record<string, string> = {
        currencyCode: 'currency.currencyCode',
        currencyName: 'currency.currencyName',
        currencySymbol: 'currency.currencySymbol',
        status: 'currency.status',
        id: 'currency.id',
        addedDateFormatted: 'currency.createdAt',
      };

      if (params?.filters) {
        const whereString = await this.general.makeFilterString(
          params.filters,
          columnMap,
          params.logicalOperator,
        );

        if (whereString) {
          queryBuilder.andWhere(whereString);
        }
      }

      if (params?.sortField && params?.sortOrder && columnMap[params.sortField]) {
        const order = params.sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(columnMap[params.sortField], order);
      } else {
        queryBuilder.orderBy('currency.currencyName', 'ASC');
      }

      queryBuilder.skip(skip);
      queryBuilder.take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      for (const currency of data) {
        currency['addedDateFormatted'] = await this.general.dateFormat(
          currency.createdAt,
        );

        if (currency.updatedAt) {
          currency['updatedDateFormatted'] = await this.general.dateFormat(
            currency.updatedAt,
          );
        }
      }

      return_data = {
        success: 1,
        message: 'Currency List fetched successfully',
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
