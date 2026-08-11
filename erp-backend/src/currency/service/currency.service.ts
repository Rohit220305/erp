import { Injectable, Logger } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '../entity/currency.entity';
import { CurrencyAddDto, CurrencyUpdateDto, DeleteCurrencyDto } from '../dto/currency.dto';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
  ) { }

  @InjectRepository(CurrencyEntity)
  private currencyRepo: Repository<CurrencyEntity>;

  async startAddCurrency(req, params: CurrencyAddDto) {
    const response = await this.addCurrency(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response, params);
    }

    return await this.finishFailure(response);
  }

  private async addCurrency(req, params: CurrencyAddDto) {
    let return_data: any = {};

    try {
      const codeExists = await this.currencyRepo.findOne({
        where: {
          currencyCode: params.currencyCode,
          sysRecDeleted: false,
        },
      });

      if (codeExists) {
        throw new Error('Currency Code already exists');
      }

      const {
        ...dbInsertData
      } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub || 0;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.currencyRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CURRENCY_CREATE',
        'CURRENCY',
        res?.raw?.insertId,
        params.currencyName,
        req.user?.companyId || 0,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Currency Added Successfully.',
        data: {
          insert_id: res?.raw?.insertId,
        },
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

  async startUpdateCurrency(req, params: CurrencyUpdateDto) {
    const response = await this.updateCurrency(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  private async updateCurrency(req, params: CurrencyUpdateDto) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Currency ID is required');
      }

      const currency = await this.currencyRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!currency) {
        throw new Error('Currency not found');
      }

      if (params.currencyCode && params.currencyCode !== currency.currencyCode) {
        const codeExists = await this.currencyRepo.findOne({
          where: {
            currencyCode: params.currencyCode,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Currency Code already exists');
        }
      }

      const {
        id: _extractedId,
        ...dbUpdateData
      } = params as any;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub || 0;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.currencyRepo.update(
        { id: params.id },
        dbUpdateData,
      );

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CURRENCY_UPDATE',
        'CURRENCY',
        params.id,
        params.currencyName || currency.currencyName,
        req.user?.companyId || 0,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Currency Updated Successfully.',
        data: {
          affected: res.affected,
        },
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

  async startDeleteCurrency(req, query: DeleteCurrencyDto) {
    const response = await this.deleteCurrency(req, query);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  private async deleteCurrency(req, query: DeleteCurrencyDto) {
    let return_data: any = {};

    try {
      if (!query.id) {
        throw new Error('Currency ID is required');
      }

      const currency = await this.currencyRepo.findOne({
        where: {
          id: query.id,
          sysRecDeleted: false,
        },
      });

      if (!currency) {
        throw new Error('Currency not found');
      }

      const payload = this.general.buildSoftDeletePayload(
        { currencyCode: currency.currencyCode },
        req,
      );
      const res = await this.currencyRepo.update({ id: query.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'CURRENCY_DELETE',
        'CURRENCY',
        query.id,
        currency.currencyName || 'Currency',
        req.user?.companyId || 0,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Currency Deleted Successfully.',
        data: {
          affected: res.affected,
        },
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
