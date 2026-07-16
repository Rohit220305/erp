import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '../entity/currency.entity';
import { ListCurrencyDto, GetCurrencyDto } from '../dto/currency.dto';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CurrencyListService {
  private readonly logger = new Logger(CurrencyListService.name);

  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly generalUtilities: GeneralUtilities,
  ) {}

  async startCurrencyList(req: any, body: ListCurrencyDto) {
    const response = await this.listCurrency(body);
    if (response.success === 1) return this.finishSuccess(response);
    return this.finishFailure(response);
  }

  private async listCurrency(body: ListCurrencyDto) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        filters,
        sortField = 'currencyName',
        sortOrder = 'DESC',
        logicalOperator = 'AND',
      } = body;

      const queryBuilder = this.currencyRepository.createQueryBuilder('currency');

      if (search) {
        queryBuilder.andWhere(
          '(currency.currencyCode LIKE :search OR currency.currencyName LIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (filters && filters.length > 0) {
        const filterString = this.generalUtilities.makeFilterString(
          filters,
          'currency',
          logicalOperator,
        );
        if (filterString) {
          queryBuilder.andWhere(filterString);
        }
      }

      queryBuilder.orderBy(`currency.${sortField}`, sortOrder);

      if (limit > 0) {
        queryBuilder.skip((page - 1) * limit).take(limit);
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        success: 1,
        message: 'Currency list fetched successfully',
        data: {
          items: data,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching currency list', error.stack);
      return { success: 0, message: 'Failed to fetch currency list' };
    }
  }

  async startCurrencyDetails(query: GetCurrencyDto) {
    const response = await this.getCurrency(query.id);
    if (response.success === 1) return this.finishSuccess(response);
    return this.finishFailure(response);
  }

  private async getCurrency(id: number) {
    try {
      const currency = await this.currencyRepository.findOne({ where: { id } });
      if (!currency) {
        return { success: 0, message: 'Currency not found' };
      }
      return { success: 1, message: 'Currency details fetched successfully', data: currency };
    } catch (error) {
      this.logger.error('Error fetching currency details', error.stack);
      return { success: 0, message: 'Failed to fetch currency details' };
    }
  }

  private finishSuccess(response: any) {
    return { success: 1, message: response.message, data: response.data };
  }

  private finishFailure(response: any) {
    return { success: 0, message: response.message };
  }
}
