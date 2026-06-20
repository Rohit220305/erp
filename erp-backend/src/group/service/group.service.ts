import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupEntity } from '../entity/group.entity';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';

import {
  GROUP_INSERT_FIELDS,
  GROUP_UPDATE_FIELDS,
} from 'src/package/constants/group-fields.constant';

@Injectable()
export class GroupService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(GroupEntity)
  private groupRepo: Repository<GroupEntity>;

  async startInsertGroup(req, params) {
    const response = await this.insertGroup(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async insertGroup(req, params) {
    let return_data: any = {};

    try {
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

      const existingGroup = await this.groupRepo.findOne({
        where: {
          groupCode: params.groupCode,
        },
      });

      if (existingGroup) {
        throw new Error('Group Code already exists');
      }

      const queryColumns = await this.general.mapFields(
        params,
        GROUP_INSERT_FIELDS,
      );

      queryColumns.addedDate = () => 'NOW()';
      queryColumns.addedBy = req.user?.sub;

      const res = await this.groupRepo.insert(queryColumns);

      return_data = {
        success: 1,
        message: 'Group Added Successfully.',
        data: {
          insert_id: res?.raw?.insertId,
        },
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

  async startUpdateGroup(req, params) {
    const response = await this.updateGroup(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async updateGroup(req, params) {
    let return_data: any = {};

    try {
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

      if (!params.id) {
        throw new Error('Group ID is required');
      }

      const group = await this.groupRepo.findOne({
        where: {
          id: params.id,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      if (params.groupCode && params.groupCode !== group.groupCode) {
        const codeExists = await this.groupRepo.findOne({
          where: {
            groupCode: params.groupCode,
          },
        });

        if (codeExists) {
          throw new Error('Group Code already exists');
        }
      }

      const queryColumns = await this.general.mapFields(
        params,
        GROUP_UPDATE_FIELDS,
      );

      queryColumns.updatedDate = () => 'NOW()';
      queryColumns.updatedBy = req.user?.sub;

      const res = await this.groupRepo.update({ id: params.id }, queryColumns);

      return_data = {
        success: 1,
        message: 'Group Updated Successfully.',
        data: {
          affected: res.affected,
        },
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

  async startDeleteGroup(req, params) {
    const response = await this.deleteGroup(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async deleteGroup(req, params) {
    let return_data: any = {};

    try {
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

      if (!params.id) {
        throw new Error('Group ID is required');
      }

      const group = await this.groupRepo.findOne({
        where: {
          id: params.id,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      const res = await this.groupRepo.delete({
        id: params.id,
      });

      return_data = {
        success: 1,
        message: 'Group Deleted Successfully.',
        data: {
          affected: res.affected,
        },
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

