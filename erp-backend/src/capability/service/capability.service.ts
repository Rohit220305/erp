import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CapabilityEntity } from '../entity/capability.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import {
  CAPABILITY_INSERT_FIELDS,
  CAPABILITY_UPDATE_FIELDS,
} from 'src/package/constants/capability-fields.constant';

@Injectable()
export class CapabilityService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(CapabilityEntity)
  private capabilityRepo: Repository<CapabilityEntity>;

  async startInsertCapability(req, params) {
    const response = await this.insertCapability(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async insertCapability(req, params) {
    let return_data: any = {};
    try {
      const existing = await this.capabilityRepo.findOne({
        where: { capabilityCode: params.capabilityCode },
      });

      if (existing) {
        throw new Error('Capability Code already exists');
      }

      const queryColumns = await this.general.mapFields(
        params,
        CAPABILITY_INSERT_FIELDS,
      );

      if (req.user) {
        queryColumns.addedBy = req.user.sub;
      }
      queryColumns.addedDate = () => 'NOW()';

      const res = await this.capabilityRepo.insert(queryColumns);

      return_data = {
        success: 1,
        message: 'Capability Added Successfully.',
        data: {
          insert_id: res?.raw?.insertId,
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

  async startUpdateCapability(req, params) {
    const response = await this.updateCapability(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async updateCapability(req, params) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('Capability ID is required');
      }

      const capability = await this.capabilityRepo.findOne({
        where: { id: params.id },
      });

      if (!capability) {
        throw new Error('Capability not found');
      }

      if (params.capabilityCode && params.capabilityCode !== capability.capabilityCode) {
        const codeExists = await this.capabilityRepo.findOne({
          where: { capabilityCode: params.capabilityCode },
        });
        if (codeExists) {
          throw new Error('Capability Code already exists');
        }
      }

      const queryColumns = await this.general.mapFields(
        params,
        CAPABILITY_UPDATE_FIELDS,
      );

      if (req.user) {
        queryColumns.updatedBy = req.user.sub;
      }
      queryColumns.updatedDate = () => 'NOW()';

      const res = await this.capabilityRepo.update({ id: params.id }, queryColumns);

      return_data = {
        success: 1,
        message: 'Capability Updated Successfully.',
        data: {
          affected: res.affected,
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

  async startDeleteCapability(req, params) {
    const response = await this.deleteCapability(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async deleteCapability(req, params) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('Capability ID is required');
      }

      const capability = await this.capabilityRepo.findOne({
        where: { id: params.id },
      });

      if (!capability) {
        throw new Error('Capability not found');
      }

      const res = await this.capabilityRepo.delete({ id: params.id });

      return_data = {
        success: 1,
        message: 'Capability Deleted Successfully.',
        data: {
          affected: res.affected,
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
    return {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data || [],
      },
    };
  }

  async finishFailure(params) {
    return params;
  }
}
