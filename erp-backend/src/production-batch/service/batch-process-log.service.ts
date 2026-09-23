import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchProcessLogEntity } from '../entity/batch-process-log.entity';
import { BatchProcessLogItemEntity } from '../entity/batch-process-log-item.entity';
import { ProductionBatchProcessEntity } from '../entity/production-batch-process.entity';
import { ProductionBatchEntity } from '../entity/production-batch.entity';
import { ProductionBatchItemEntity } from '../entity/production-batch-item.entity';
import { CompanyEntity } from '../../company/entity/company.entity';
import { GeneralUtilities } from '../../package/utilities/general.utilities';
import { CreateProcessLogDto } from '../dto/production-batch.dto';
import { LogType, MaterialType } from '../enum/production-batch.enum';
import { ProcessExecutionService } from './process-execution.service';

@Injectable()
export class BatchProcessLogService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly processExecutionService: ProcessExecutionService,
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(BatchProcessLogEntity)
    private readonly logRepo: Repository<BatchProcessLogEntity>,
    @InjectRepository(BatchProcessLogItemEntity)
    private readonly logItemRepo: Repository<BatchProcessLogItemEntity>,
    @InjectRepository(ProductionBatchProcessEntity)
    private readonly pbpRepo: Repository<ProductionBatchProcessEntity>,
    @InjectRepository(ProductionBatchItemEntity)
    private readonly pbItemRepo: Repository<ProductionBatchItemEntity>,
    @InjectRepository(ProductionBatchEntity)
    private readonly pbRepo: Repository<ProductionBatchEntity>,
  ) { }

  private async generateLogCode(companyId: number): Promise<string> {
    const company = await this.companyRepo
      .createQueryBuilder('c')
      .select(['c.id as id', 'c.companyName as companyName'])
      .where('c.id = :companyId', { companyId })
      .andWhere('c.sysRecDeleted = 0')
      .getRawOne();

    if (!company) {
      throw new Error(`Company not found`);
    }

    const prefixKey = '-BPL';
    const prefix = this.general.getCodePrefix(company.companyName, prefixKey);

    const lastRecord = await this.logRepo
      .createQueryBuilder('log')
      .select('log.logCode', 'logCode')
      .where('log.companyId = :companyId', { companyId })
      .andWhere('log.logCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('log.id', 'DESC')
      .getRawOne();

    return this.general.generateCode(
      company.companyName,
      prefixKey,
      lastRecord?.logCode || null,
    );
  }

  async createLog(req: any, dto: CreateProcessLogDto) {
    let return_data: any = {};
    try {
      const companyId = req.user?.companyId;

      const processQb = this.pbpRepo
        .createQueryBuilder('pbp')
        .select([
          'pbp.id as id',
          'pbp.productionBatchId as productionBatchId',
          'pbp.sequenceNumber as sequenceNumber',
          'pbp.companyId as companyId',
        ])
        .where('pbp.id = :processId', { processId: dto.productionBatchProcessId });

      if (companyId) {
        processQb.andWhere('pbp.companyId = :companyId', { companyId });
      }

      const process = await processQb.getRawOne();
      if (!process) {
        return_data = { success: 0, message: 'Invalid Production Batch Process' };
        return return_data;
      }

      const batch = await this.pbRepo
        .createQueryBuilder('pb')
        .select(['pb.id as id', 'pb.productionOrderId as productionOrderId'])
        .where('pb.id = :batchId', { batchId: process.productionBatchId })
        .getRawOne();

      if (!batch) {
        return_data = { success: 0, message: 'Invalid Production Batch' };
        return return_data;
      }

      const logCode = await this.generateLogCode(companyId);

      const batchItemsQb = this.pbItemRepo
        .createQueryBuilder('pbi')
        .select([
          'pbi.id as id',
          'pbi.itemId as itemId',
          'pbi.materialType as materialType',
          'pbi.requiredQty as requiredQty',
          'pbi.consumedQty as consumedQty',
          'pbi.producedQty as producedQty',
        ])
        .where('pbi.productionBatchProcessId = :processId', { processId: process.id });

      if (companyId) {
        batchItemsQb.andWhere('pbi.companyId = :companyId', { companyId });
      }

      const batchItems = await batchItemsQb.getRawMany();

      if (!batchItems || batchItems.length === 0) {
        return_data = { success: 0, message: 'No items found for this process.' };
        return return_data;
      }

      let allBatchItems: any[] = [];
      if (dto.logType === LogType.Consumption) {
        const allBatchItemsQb = this.pbItemRepo
          .createQueryBuilder('pbi')
          .leftJoin('production_batch_process', 'pbp', 'pbi.productionBatchProcessId = pbp.id')
          .select([
            'pbi.itemId as itemId',
            'pbi.materialType as materialType',
            'pbi.consumedQty as consumedQty',
            'pbi.producedQty as producedQty',
            'pbp.sequenceNumber as sequenceNumber',
          ])
          .where('pbp.productionBatchId = :batchId', { batchId: process.productionBatchId });

        if (companyId) {
          allBatchItemsQb.andWhere('pbi.companyId = :companyId', { companyId });
        }

        allBatchItems = await allBatchItemsQb.getRawMany();
      }

      const logItemsToInsert: { itemId: number; loggedQty: number }[] = [];

      for (const reqItem of dto.items) {
        if (reqItem.loggedQty <= 0) continue;

        const targetBatchItem = batchItems.find((bi) => Number(bi.itemId) === Number(reqItem.itemId));

        if (!targetBatchItem) {
          return_data = { success: 0, message: `Item ID ${reqItem.itemId} is not mapped to this process.` };
          return return_data;
        }

        const expectedType = dto.logType === LogType.Consumption ? MaterialType.Entry : MaterialType.Exit;
        if (targetBatchItem.materialType !== expectedType) {
          return_data = { success: 0, message: `Item ID ${reqItem.itemId} must be of type ${expectedType} for a ${dto.logType} log.` };
          return return_data;
        }

        if (dto.logType === LogType.Consumption) {
          const newTotal = Number(targetBatchItem.consumedQty) + Number(reqItem.loggedQty);
          if (newTotal > Number(targetBatchItem.requiredQty)) {
            return_data = {
              success: 0,
              message: `Cannot consume ${reqItem.loggedQty} for Item ${reqItem.itemId}. Exceeds required quantity of ${targetBatchItem.requiredQty}.`,
            };
            return return_data;
          }

          const isSemiFinishedItem = allBatchItems.some(
            (bi) =>
              Number(bi.itemId) === Number(reqItem.itemId) &&
              bi.materialType === MaterialType.Exit &&
              Number(bi.sequenceNumber) < Number(process.sequenceNumber)
          );

          if (isSemiFinishedItem) {
            const upstreamProduced = allBatchItems
              .filter(
                (bi) =>
                  Number(bi.itemId) === Number(reqItem.itemId) &&
                  bi.materialType === MaterialType.Exit &&
                  Number(bi.sequenceNumber) < Number(process.sequenceNumber),
              )
              .reduce((sum, bi) => sum + Number(bi.producedQty), 0);

            const totalConsumedElsewhere = allBatchItems
              .filter(
                (bi) =>
                  Number(bi.itemId) === Number(reqItem.itemId) &&
                  bi.materialType === MaterialType.Entry,
              )
              .reduce((sum, bi) => sum + Number(bi.consumedQty), 0);

            const availableWip = upstreamProduced - totalConsumedElsewhere;
            if (reqItem.loggedQty > availableWip) {
              return_data = {
                success: 0,
                message: `Insufficient WIP stock for Item ${reqItem.itemId}. This semi-finished item must be produced in a previous process first. Available: ${availableWip}`,
              };
              return return_data;
            }
          }

          await this.pbItemRepo
            .createQueryBuilder()
            .update(ProductionBatchItemEntity)
            .set({
              consumedQty: () => `consumedQty + ${Number(reqItem.loggedQty)}`,
              availableStock: () => `GREATEST(receivedQty - (consumedQty + ${Number(reqItem.loggedQty)}), 0)`,
            })
            .where('id = :id', { id: targetBatchItem.id })
            .execute();
        } else {
          await this.pbItemRepo
            .createQueryBuilder()
            .update(ProductionBatchItemEntity)
            .set({
              producedQty: () => `producedQty + ${Number(reqItem.loggedQty)}`,
              availableStock: () => `producedQty + ${Number(reqItem.loggedQty)}`,
            })
            .where('id = :id', { id: targetBatchItem.id })
            .execute();
        }

        logItemsToInsert.push({
          itemId: reqItem.itemId,
          loggedQty: reqItem.loggedQty,
        });
      }

      if (logItemsToInsert.length === 0) {
        return_data = { success: 0, message: 'No items with quantity > 0 to log.' };
        return return_data;
      }

      const insertResult = await this.logRepo
        .createQueryBuilder()
        .insert()
        .into(BatchProcessLogEntity)
        .values({
          companyId,
          logCode,
          productionOrderId: batch.productionOrderId,
          productionBatchId: process.productionBatchId,
          productionBatchProcessId: process.id,
          logType: dto.logType,
          logDate: new Date(dto.logDate),
          addedBy: req.user?.sub || null,
          addedDate: new Date(),
        })
        .execute();

      const logId = insertResult.raw.insertId;

      await this.logItemRepo
        .createQueryBuilder()
        .insert()
        .into(BatchProcessLogItemEntity)
        .values(
          logItemsToInsert.map((li) => ({
            ...li,
            batchProcessLogId: logId,
          })),
        )
        .execute();

      await this.processExecutionService.evaluateReadiness(process.productionBatchId);

      return_data = {
        success: 1,
        message: 'Process log created successfully.',
        data: { logCode },
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }
}
