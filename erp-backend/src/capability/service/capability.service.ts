import { CreateCapabilityDto, UpdateCapabilityDto, DeleteCapabilityDto } from '../dto/capability.dto';
import { Injectable } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CapabilityEntity } from '../entity/capability.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';


@Injectable()
export class CapabilityService {
  constructor(private readonly general: GeneralUtilities) { }

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
        where: { capabilityCode: params.capabilityCode, sysRecDeleted: false },
      });

      if (existing) {
        throw new Error('Capability Code already exists');
      }

      const {
        ...dbInsertData
      } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      if (req.user) {
        dbInsertData.addedBy = req.user.sub;
      }
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.capabilityRepo.insert(dbInsertData);

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
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!capability) {
        throw new Error('Capability not found');
      }

      if (params.capabilityCode && params.capabilityCode !== capability.capabilityCode) {
        const codeExists = await this.capabilityRepo.findOne({
          where: { capabilityCode: params.capabilityCode, sysRecDeleted: false },
        });
        if (codeExists) {
          throw new Error('Capability Code already exists');
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

      if (req.user) {
        dbUpdateData.updatedBy = req.user.sub;
      }
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.capabilityRepo.update({ id: params.id }, dbUpdateData);

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
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!capability) {
        throw new Error('Capability not found');
      }

      const payload = this.general.buildSoftDeletePayload(
        { capabilityCode: capability.capabilityCode },
        req,
      );

      const res = await this.capabilityRepo.update(
        { id: params.id },
        payload
      );

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
