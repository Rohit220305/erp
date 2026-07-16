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
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async startAddCurrency(req: any, body: CurrencyAddDto) {
    body.createdBy = req.user.sub;
    const response = await this.addCurrency(body);
    if (response.success === 1) {
      await this.activityLogService.log({
        activityCode: 'CURRENCY_CREATE',
        actorUserId: req.user.sub,
        companyId: req.user.companyId || null,
        entityType: 'Currency',
        entityId: response.data?.id,
        entityName: body.currencyName,
      });
      return this.finishSuccess(response);
    }
    return this.finishFailure(response);
  }

  private async addCurrency(body: CurrencyAddDto) {
    try {
      const newCurrency = this.currencyRepository.create(body);
      const saved = await this.currencyRepository.save(newCurrency);
      
      return { success: 1, message: 'Currency created successfully', data: saved };
    } catch (error) {
      this.logger.error('Error adding currency', error.stack);
      if (error.code === 'ER_DUP_ENTRY') {
        return { success: 0, message: 'Currency code already exists' };
      }
      return { success: 0, message: 'Failed to create currency' };
    }
  }

  async startUpdateCurrency(req: any, body: CurrencyUpdateDto) {
    body.updatedBy = req.user.sub;
    const response = await this.updateCurrency(body);
    if (response.success === 1) {
      await this.activityLogService.log({
        activityCode: 'CURRENCY_UPDATE',
        actorUserId: req.user.sub,
        companyId: req.user.companyId || null,
        entityType: 'Currency',
        entityId: body.id,
        entityName: body.currencyName || 'Unknown',
      });
      return this.finishSuccess(response);
    }
    return this.finishFailure(response);
  }

  private async updateCurrency(body: CurrencyUpdateDto) {
    try {
      const currency = await this.currencyRepository.findOne({ where: { id: body.id } });
      if (!currency) {
        return { success: 0, message: 'Currency not found' };
      }

      Object.assign(currency, body);
      currency.updatedAt = new Date();

      const saved = await this.currencyRepository.save(currency);
      return { success: 1, message: 'Currency updated successfully', data: saved };
    } catch (error) {
      this.logger.error('Error updating currency', error.stack);
      if (error.code === 'ER_DUP_ENTRY') {
        return { success: 0, message: 'Currency code already exists' };
      }
      return { success: 0, message: 'Failed to update currency' };
    }
  }

  async startDeleteCurrency(req: any, query: DeleteCurrencyDto) {
    const response = await this.deleteCurrency(query.id);
    if (response.success === 1) {
      await this.activityLogService.log({
        activityCode: 'CURRENCY_DELETE',
        actorUserId: req.user.sub,
        companyId: req.user.companyId || null,
        entityType: 'Currency',
        entityId: query.id,
        entityName: response.data?.currencyName || 'Unknown',
      });
      return this.finishSuccess(response);
    }
    return this.finishFailure(response);
  }

  private async deleteCurrency(id: number) {
    try {
      const currency = await this.currencyRepository.findOne({ where: { id } });
      if (!currency) {
        return { success: 0, message: 'Currency not found' };
      }
      
      await this.currencyRepository.delete(id);
      return { success: 1, message: 'Currency deleted successfully', data: currency };
    } catch (error) {
      this.logger.error('Error deleting currency', error.stack);
      // Catch foreign key constraint violation
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return { success: 0, message: 'Cannot delete currency as it is currently in use. Please deactivate it instead.' };
      }
      return { success: 0, message: 'Failed to delete currency' };
    }
  }

  private finishSuccess(response: any) {
    return { success: 1, message: response.message, data: response.data };
  }

  private finishFailure(response: any) {
    return { success: 0, message: response.message };
  }
}
