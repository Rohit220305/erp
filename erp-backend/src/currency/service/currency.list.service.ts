import { GetCurrencyDto, ListCurrencyDto } from '../dto/currency.dto';
import { Injectable } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CurrencyEntity } from '../entity/currency.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CurrencyListService {
  constructor(private readonly general: GeneralUtilities) { }

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

      const queryBuilder = this.currencyRepo.createQueryBuilder('currency');

      queryBuilder.select([
        'currency.id AS id',
        'currency.currencyCode AS currencyCode',
        'currency.currencyName AS currencyName',
        'currency.currencySymbol AS currencySymbol',
        'currency.status AS status',
        'currency.addedDate AS addedDate',
        'currency.updatedDate AS updatedDate',
        'currency.addedBy AS addedBy',
        'currency.updatedBy AS updatedBy',
      ]);

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = currency.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = currency.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('currency.id = :id', { id: params.id });
      queryBuilder.andWhere('currency.sysRecDeleted = 0');

      const currency = await queryBuilder.getRawOne();
      if (!currency) {
        throw new Error('Currency not found');
      }

      currency.addedDateFormatted = await this.general.dateFormat(
        currency.addedDate,
      );

      if (currency.updatedDate) {
        currency.updatedDateFormatted = await this.general.dateFormat(
          currency.updatedDate,
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
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.currencyRepo.createQueryBuilder('currency');

      queryBuilder.select([
        'currency.id AS id',
        'currency.currencyCode AS currencyCode',
        'currency.currencyName AS currencyName',
        'currency.currencySymbol AS currencySymbol',
        'currency.status AS status',
        'currency.addedDate AS addedDate',
        'currency.updatedDate AS updatedDate',
      ]);

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = currency.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = currency.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('currency.sysRecDeleted = 0');

      await this.general.applyListQuery(queryBuilder, params, 'currency.currencyName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Currency List fetched successfully',
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

  async finishFailure(params: any, incomingData?: any) {
    let output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'Something went wrong',
        data: params?.data ? params.data : [],
      },
    };

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }
}
