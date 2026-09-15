import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductionBatchEntity } from '../entity/production-batch.entity';
import { ProductionBatchProcessEntity } from '../entity/production-batch-process.entity';
import { ProductionBatchItemEntity } from '../entity/production-batch-item.entity';
import { ProductionOrderEntity } from '../../production-order/entity/production-order.entity';
import { ProductionOrderStatus } from '../../production-order/enum/production-order.enum';
import { ProcessExecutionDto, MarkBatchCompletedDto } from '../dto/production-batch.dto';
import { ProductionBatchProcessStatus, ProductionBatchStatus, MaterialStatus, MaterialType } from '../enum/production-batch.enum';
import { BatchItemCategorizerUtility } from '../utility/batch-item-categorizer.utility';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

@Injectable()
export class ProcessExecutionService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly itemCategorizer: BatchItemCategorizerUtility,
    @InjectRepository(ProductionBatchEntity)
    private readonly pbRepo: Repository<ProductionBatchEntity>,
    @InjectRepository(ProductionBatchProcessEntity)
    private readonly pbProcessRepo: Repository<ProductionBatchProcessEntity>,
    @InjectRepository(ProductionBatchItemEntity)
    private readonly pbItemRepo: Repository<ProductionBatchItemEntity>,
    @InjectRepository(ProductionOrderEntity)
    private readonly poRepo: Repository<ProductionOrderEntity>,
  ) {}

  private async finishSuccess(params: any, incomingData?: any) {
    const output: any = {
      settings: {
        success: params?.success || 1,
        message: params?.message || 'Success',
        data: params?.data !== undefined ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  private async finishFailure(params: any, incomingData?: any) {
    const output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'Something went wrong',
        data: params?.data !== undefined ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  async startProcess(dto: ProcessExecutionDto, req: IAppRequest) {
    const companyId = req.user?.companyId || 1;
    const process = await this.pbProcessRepo.findOne({
      where: { id: dto.processExecutionId, productionBatchId: dto.batchId, companyId },
    });

    if (!process) {
      return this.finishFailure({ message: 'Process execution record not found.' }, dto);
    }

    if (
      process.status !== ProductionBatchProcessStatus.ReadytoStart &&
      process.status !== ProductionBatchProcessStatus.YetToStart
    ) {
      return this.finishFailure({ message: `Cannot start process with status ${process.status}.` }, dto);
    }

    process.status = ProductionBatchProcessStatus.InProgress;
    if (!process.startTime) {
      process.startTime = new Date();
    }
    await this.pbProcessRepo.save(process);

    const batch = await this.pbRepo.findOne({ where: { id: dto.batchId, companyId } });
    if (
      batch &&
      (batch.status === ProductionBatchStatus.Pending || batch.status === ProductionBatchStatus.StockReceived)
    ) {
      batch.status = ProductionBatchStatus.InProgress;
      await this.pbRepo.save(batch);
    }

    return this.finishSuccess({ message: 'Process started successfully.', data: process }, dto);
  }

  async pauseProcess(dto: ProcessExecutionDto, req: IAppRequest) {
    const companyId = req.user?.companyId || 1;
    const process = await this.pbProcessRepo.findOne({
      where: { id: dto.processExecutionId, productionBatchId: dto.batchId, companyId },
    });

    if (!process) {
      return this.finishFailure({ message: 'Process execution record not found.' }, dto);
    }

    if (process.status !== ProductionBatchProcessStatus.InProgress) {
      return this.finishFailure({ message: `Cannot pause process with status ${process.status}.` }, dto);
    }

    process.status = ProductionBatchProcessStatus.Paused;
    await this.pbProcessRepo.save(process);

    return this.finishSuccess({ message: 'Process paused successfully.', data: process }, dto);
  }

  async resumeProcess(dto: ProcessExecutionDto, req: IAppRequest) {
    const companyId = req.user?.companyId || 1;
    const process = await this.pbProcessRepo.findOne({
      where: { id: dto.processExecutionId, productionBatchId: dto.batchId, companyId },
    });

    if (!process) {
      return this.finishFailure({ message: 'Process execution record not found.' }, dto);
    }

    if (process.status !== ProductionBatchProcessStatus.Paused) {
      return this.finishFailure({ message: `Cannot resume process with status ${process.status}.` }, dto);
    }

    process.status = ProductionBatchProcessStatus.InProgress;
    await this.pbProcessRepo.save(process);

    return this.finishSuccess({ message: 'Process resumed successfully.', data: process }, dto);
  }

  async finishProcess(dto: ProcessExecutionDto, req: IAppRequest) {
    const companyId = req.user?.companyId || 1;
    const process = await this.pbProcessRepo.findOne({
      where: { id: dto.processExecutionId, productionBatchId: dto.batchId, companyId },
    });

    if (!process) {
      return this.finishFailure({ message: 'Process execution record not found.' }, dto);
    }

    if (process.status !== ProductionBatchProcessStatus.InProgress) {
      return this.finishFailure({ message: `Cannot finish process with status ${process.status}.` }, dto);
    }

    process.status = ProductionBatchProcessStatus.Completed;
    process.endTime = new Date();
    await this.pbProcessRepo.save(process);

    const allProcesses = await this.pbProcessRepo.find({
      where: { productionBatchId: dto.batchId, companyId },
      order: { sequenceNumber: 'DESC' },
    });

    const isLastProcess = allProcesses.length > 0 && allProcesses[0].id === process.id;
    if (isLastProcess) {
      const batch = await this.pbRepo.findOne({ where: { id: dto.batchId, companyId } });
      if (batch) {
        batch.producedQuantity = dto.producedQty !== undefined ? dto.producedQty : batch.batchQuantity;
        await this.pbRepo.save(batch);
      }
    }

    await this.evaluateReadiness(dto.batchId);

    return this.finishSuccess({ message: 'Process finished successfully.', data: process }, dto);
  }

  async markBatchCompleted(dto: MarkBatchCompletedDto, req: IAppRequest) {
    const companyId = req.user?.companyId || 1;
    const batch = await this.pbRepo.findOne({ where: { id: dto.batchId, companyId } });

    if (!batch) {
      return this.finishFailure({ message: 'Production batch not found.' }, dto);
    }

    const processes = await this.pbProcessRepo.find({
      where: { productionBatchId: dto.batchId, companyId },
    });

    const allCompleted =
      processes.length > 0 &&
      processes.every(
        (p) =>
          p.status === ProductionBatchProcessStatus.Completed ||
          p.status === ProductionBatchProcessStatus.Skipped,
      );

    if (!allCompleted) {
      return this.finishFailure(
        { message: 'All processes must be completed before marking batch completed.' },
        dto,
      );
    }

    batch.status = ProductionBatchStatus.Completed;
    batch.markCompleted = true;
    if (req.user?.sub) {
      batch.completedBy = req.user.sub;
    }
    await this.pbRepo.save(batch);

    // Update parent order status if target quantity met
    const po = await this.poRepo.findOne({ where: { id: batch.productionOrderId } });
    if (po) {
      const completedBatches = await this.pbRepo.find({
        where: {
          productionOrderId: batch.productionOrderId,
          status: In([ProductionBatchStatus.Completed, ProductionBatchStatus.Finished]),
          sysRecDeleted: false,
        }
      });
      
      const totalProduced = completedBatches.reduce((sum, b) => sum + (b.batchQuantity || 0), 0);
      if (totalProduced >= po.productionQuantity) {
        po.status = ProductionOrderStatus.Completed;
        await this.poRepo.save(po);
      }
    }

    return this.finishSuccess({ message: 'Production batch marked as completed.', data: batch }, dto);
  }

  async evaluateReadiness(productionBatchId: number) {
    const batch = await this.pbRepo.findOne({ where: { id: productionBatchId } });
    if (!batch) return;

    const processes = await this.pbProcessRepo.find({
      where: { productionBatchId },
      order: { sequenceNumber: 'ASC' },
    });

    if (!processes || processes.length === 0) return;

    const processIds = processes.map((p) => p.id);
    const items = await this.pbItemRepo.find({
      where: { productionBatchProcessId: In(processIds) },
    });

    const categorized = this.itemCategorizer.categorizeBatchItems(
      items,
      batch.itemId || undefined,
      undefined,
      batch,
    );

    const semiFinishedItemIds = new Set<number>(
      categorized.semiFinished.map((sf) => Number(sf.itemId)),
    );

    const rawMaterialItemIds = new Set<number>(
      categorized.rawMaterials.map((rm) => Number(rm.itemId)),
    );

    for (const proc of processes) {
      if (proc.status !== ProductionBatchProcessStatus.YetToStart) {
        continue;
      }

      const predecessors = processes.filter((p) => p.sequenceNumber < proc.sequenceNumber);
      const predecessorsCompleted = predecessors.every(
        (p) =>
          p.status === ProductionBatchProcessStatus.Completed ||
          p.status === ProductionBatchProcessStatus.Skipped,
      );

      if (!predecessorsCompleted) {
        continue;
      }

      const procItems = items.filter((i) => i.productionBatchProcessId === proc.id);
      const procEntryItems = procItems.filter((i) => i.materialType === MaterialType.Entry);

      let canStart = true;

      for (const entryItem of procEntryItems) {
        const itemId = Number(entryItem.itemId);

        if (rawMaterialItemIds.has(itemId)) {
          if (batch.materialStatus !== MaterialStatus.OrderReceived) {
            canStart = false;
            break;
          }
        }

        if (semiFinishedItemIds.has(itemId)) {
          const upstreamProduced = items
            .filter((i) => {
              const parentProc = processes.find((p) => p.id === i.productionBatchProcessId);
              return (
                Number(i.itemId) === itemId &&
                i.materialType === MaterialType.Exit &&
                parentProc &&
                parentProc.sequenceNumber < proc.sequenceNumber
              );
            })
            .reduce((sum, i) => sum + Number(i.producedQty || 0), 0);

          const consumedElsewhere = items
            .filter((i) => {
              const parentProc = processes.find((p) => p.id === i.productionBatchProcessId);
              return (
                Number(i.itemId) === itemId &&
                i.materialType === MaterialType.Entry &&
                parentProc &&
                parentProc.sequenceNumber < proc.sequenceNumber
              );
            })
            .reduce((sum, i) => sum + Number(i.consumedQty || 0), 0);

          const availableWip = upstreamProduced - consumedElsewhere;
          const requiredQty = Number(entryItem.requiredQty || 0);

          if (availableWip < requiredQty) {
            canStart = false;
            break;
          }
        }
      }

      if (canStart) {
        proc.status = ProductionBatchProcessStatus.ReadytoStart;
        await this.pbProcessRepo.save(proc);
      }
    }
  }
}
