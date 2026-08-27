import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessTemplateEntity } from '../entity/process.template.entity';
import { ProcessTemplateMappingEntity } from '../entity/process.template.mapping.entity';
import { BomEntity } from '../../bom/entity/bom.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class ProcessTemplateListService {
  constructor(private readonly general: GeneralUtilities) { }

  @InjectRepository(ProcessTemplateEntity)
  private processTemplateRepo: Repository<ProcessTemplateEntity>;

  @InjectRepository(ProcessTemplateMappingEntity)
  private processTemplateMappingRepo: Repository<ProcessTemplateMappingEntity>;

  @InjectRepository(BomEntity)
  private bomRepo: Repository<BomEntity>;

  async startProcessTemplateDetails(req, params) {
    const response = await this.getProcessTemplateDetails(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getProcessTemplateDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Template ID is required');
      }

      const queryBuilder = this.processTemplateRepo.createQueryBuilder('template');

      queryBuilder.select([
        'template.id AS id',
        'template.templateCode AS templateCode',
        'template.templateName AS templateName',
        'template.executionType AS executionType',
        'template.remark AS remark',
        'template.status AS status',
        'template.companyId AS companyId',
        'template.addedDate AS addedDate',
        'template.updatedDate AS updatedDate',
        'template.addedBy AS addedBy',
        'template.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = template.companyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = template.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = template.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('template.id = :id', { id: params.id });
      queryBuilder.andWhere('template.sysRecDeleted = 0');

      const template = await queryBuilder.getRawOne();

      if (!template) {
        throw new Error('Process Template not found');
      }

      this.general.assertCompanyAccess(req, template.companyId, 'view', 'template');

      template.addedDateFormatted = await this.general.dateFormat(
        template.addedDate,
      );

      if (template.updatedDate) {
        template.updatedDateFormatted = await this.general.dateFormat(
          template.updatedDate,
        );
      }

      const mappingQb = this.processTemplateMappingRepo.createQueryBuilder('mapping');
      mappingQb.select([
        'mapping.id AS id',
        'mapping.processId AS processId',
        'mapping.sequenceNo AS sequenceNo',
        'mapping.dependencies AS dependencies',
        'mapping.nodePosition AS nodePosition',
        'mapping.handleConfig AS handleConfig',
        'process.processName AS processName',
        'process.processCode AS processCode',
      ]);
      mappingQb.leftJoin('process_master', 'process', 'process.id = mapping.processId');
      mappingQb.where('mapping.templateId = :templateId', { templateId: params.id });
      mappingQb.orderBy('mapping.sequenceNo', 'ASC');

      const processes = await mappingQb.getRawMany();

      processes.forEach((proc) => {
        if (typeof proc.dependencies === 'string') {
          try {
            proc.dependencies = JSON.parse(proc.dependencies);
          } catch (e) {
            proc.dependencies = [];
          }
        }
        if (typeof proc.nodePosition === 'string') {
          try {
            proc.nodePosition = JSON.parse(proc.nodePosition);
          } catch (e) {
            proc.nodePosition = null;
          }
        }
        if (typeof proc.handleConfig === 'string') {
          try {
            proc.handleConfig = JSON.parse(proc.handleConfig);
          } catch (e) {
            proc.handleConfig = null;
          }
        }
      });

      template.processes = processes;

      const bomCount = await this.bomRepo.count({
        where: {
          processTemplateId: params.id,
          sysRecDeleted: false,
        },
      });
      template.isTemplateInUse = bomCount > 0;
      template.isEditable = bomCount === 0;

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: template,
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

  async startProcessTemplateList(req, params) {
    const response = await this.getProcessTemplateList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getProcessTemplateList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.processTemplateRepo.createQueryBuilder('template');

      queryBuilder.select([
        'template.id AS id',
        'template.templateCode AS templateCode',
        'template.templateName AS templateName',
        'template.executionType AS executionType',
        'template.remark AS remark',
        'template.status AS status',
        'template.companyId AS companyId',
        'template.addedDate AS addedDate',
        'template.updatedDate AS updatedDate',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = template.companyId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = template.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = template.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('template.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'template');

      await this.general.applyListQuery(queryBuilder, params, 'template.templateName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      if (data && data.length > 0) {
        const templateIds = data.map((item) => Number(item.id)).filter(Boolean);
        if (templateIds.length > 0) {
          const activeBoms = await this.bomRepo.createQueryBuilder('bom')
            .select('bom.processTemplateId', 'processTemplateId')
            .where('bom.processTemplateId IN (:...ids)', { ids: templateIds })
            .andWhere('bom.sysRecDeleted = 0')
            .getRawMany();

          const usedSet = new Set(activeBoms.map((b) => Number(b.processTemplateId)));
          data.forEach((item) => {
            const isUsed = usedSet.has(Number(item.id));
            item.isTemplateInUse = isUsed;
            item.isEditable = !isUsed;
          });
        }
      }

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Process Template List fetched successfully',
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

