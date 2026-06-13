import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class UserAuthService {

  constructor(private readonly general: GeneralUtilities) {}
  @InjectRepository(UserEntity)
  private userRepo: Repository<UserEntity>;

  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;

  @InjectRepository(GroupEntity)
  private groupRepo: Repository<GroupEntity>;

  async startLogin(params) {
    const response = await this.login(params);

    if (response.success === 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async login(params) {
    let return_data: any = {};
    console.log( params);
    try {
      if (!params.userName) {
        throw new Error('Username is required');
      }

      if (!params.password) {
        throw new Error('Password is required');
      }

      const user = await this.userRepo.findOne({
        where: {
          userName: params.userName,
        },
      });

      if (!user) {
        throw new Error('Invalid Username');
      }

      if (user.status !== 'Active') {
        throw new Error('User is InActive');
      }
        
      const passwordMatch = await bcrypt.compare(
        params.password,
        user.password,
      );
        

      if (!passwordMatch) {
        throw new Error('Invalid Password');
      }

      await this.userRepo.update(
        { id: user.id },
        {
          lastLoginDate: () => 'NOW()' as any,
        },
      );

      const company = await this.companyRepo.findOne({
        where: {
          id: user.companyId,
        },
      });

      const group = await this.groupRepo.findOne({
        where: {
          id: user.groupId,
        },
      });

      //   delete user.password;

      user['companyName'] = company?.companyName || '';

      user['groupName'] = group?.groupName || '';

      if (user.profilePhoto) {
        user['photoUrl'] = await this.general.generateUrl(
          'users',
          `${user.id}`,
          user.profilePhoto,
        );
      }

      const { password, ...safeUser } = user;

      return_data = {
        success: 1,
        message: 'Login Successful',
        data: safeUser,
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
        success: params.success,    
        message: params.message,
        data: params.data || [],
      },
    };
  }

  async finishFailure(params) {
    return params;
  }
}
