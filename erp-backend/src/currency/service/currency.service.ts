import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '../entity/currency.entity';
import { CurrencyAddDto, CurrencyUpdateDto, DeleteCurrencyDto } from '../dto/currency.dto';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    private readonly activityLogService: ActivityLogService,
  ) {}

  @InjectRepository(CurrencyEntity)
  private currencyRepo: Repository<CurrencyEntity>;

  async startAddCurrency(req: any, params: CurrencyAddDto) {
    const response = await this.addCurrency(req, params);

    if (response.success == 1) {
      await this.activityLogService.log({
        activityCode: 'CURRENCY_CREATE',
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId || undefined,
        companyId: req.user?.companyId || null,
        entityType: 'CURRENCY',
        entityId: response?.data?.id,
        entityName: params.currencyName,
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      });

      return await this.finishSuccess(response, params);
    }

    return await this.finishFailure(response);
  }

  private async addCurrency(req: any, params: CurrencyAddDto) {
    let return_data: any = {};

    try {
      const codeExists = await this.currencyRepo.findOne({
        where: {
          currencyCode: params.currencyCode,
        },
      });

      if (codeExists) {
        throw new Error('Currency Code already exists');
      }

      const currencyData = this.currencyRepo.create({
        ...params,
        createdBy: req.user?.sub,
      });

      const saved = await this.currencyRepo.save(currencyData);

      return_data = {
        success: 1,
        message: 'Currency Added Successfully.',
        data: saved,
      };
    } catch (err) {
      this.logger.error('Error adding currency', err.stack);
      return_data = {
        success: 0,
        message: err.message || 'Failed to create currency',
      };
    }

    return return_data;
  }

  async startUpdateCurrency(req: any, params: CurrencyUpdateDto) {
    const response = await this.updateCurrency(req, params);

    if (response.success == 1) {
      await this.activityLogService.log({
        activityCode: 'CURRENCY_UPDATE',
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId || undefined,
        companyId: req.user?.companyId || null,
        entityType: 'CURRENCY',
        entityId: params.id,
        entityName: params.currencyName || 'Currency',
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      });

      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  private async updateCurrency(req: any, params: CurrencyUpdateDto) {
    let return_data: any = {};

    try {
      if (!params.id) {
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

      if (params.currencyCode && params.currencyCode !== currency.currencyCode) {
        const codeExists = await this.currencyRepo.findOne({
          where: {
            currencyCode: params.currencyCode,
          },
        });

        if (codeExists) {
          throw new Error('Currency Code already exists');
        }
      }

      Object.assign(currency, params);
      currency.updatedBy = req.user?.sub;
      currency.updatedAt = new Date();

      const saved = await this.currencyRepo.save(currency);

      return_data = {
        success: 1,
        message: 'Currency Updated Successfully.',
        data: saved,
      };
    } catch (err) {
      this.logger.error('Error updating currency', err.stack);
      return_data = {
        success: 0,
        message: err.message || 'Failed to update currency',
      };
    }

    return return_data;
  }

  async startDeleteCurrency(req: any, query: DeleteCurrencyDto) {
    const response = await this.deleteCurrency(req, query);

    if (response.success == 1) {
      await this.activityLogService.log({
        activityCode: 'CURRENCY_DELETE',
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId || undefined,
        companyId: req.user?.companyId || null,
        entityType: 'CURRENCY',
        entityId: query.id,
        entityName: response.data?.currencyName || 'Currency',
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      });

      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  private async deleteCurrency(req: any, query: DeleteCurrencyDto) {
    let return_data: any = {};

    try {
      if (!query.id) {
        throw new Error('Currency ID is required');
      }

      const currency = await this.currencyRepo.findOne({
        where: {
          id: query.id,
        },
      });

      if (!currency) {
        throw new Error('Currency not found');
      }

      await this.currencyRepo.delete({ id: query.id });

      return_data = {
        success: 1,
        message: 'Currency Deleted Successfully.',
        data: currency,
      };
    } catch (err) {
      this.logger.error('Error deleting currency', err.stack);
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return_data = {
          success: 0,
          message: 'Cannot delete currency as it is currently in use. Please deactivate it instead.',
        };
      } else {
        return_data = {
          success: 0,
          message: err.message || 'Failed to delete currency',
        };
      }
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

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }

  async finishFailure(params: any) {
    return params;
  }
}
