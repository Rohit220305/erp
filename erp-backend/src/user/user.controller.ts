import { CAPABILITIES } from 'src/package/config/capabilities.config';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

import { FileInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';

import {
  UserAddDto,
  UserUpdateDto,
  UserDeleteDto,
  UserDetailsDto,
  UserListDto,
} from './dto/user.dto';

import { UserService } from './service/user.service';
import { UserListService } from './service/user.list.service';
import { imageMulterConfig } from 'src/package/config/multer.config';
import { CommonFileDto } from 'src/package/dto/common-file.dto';
import { CommonFileService } from 'src/package/service/common-file.service';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userListService: UserListService,
    private readonly commonFileService: CommonFileService,
  ) { }

  @Post('add-user')
  @RequirePermission(CAPABILITIES.USER.CREATE)
  @UseInterceptors(FileInterceptor('profilePhoto', imageMulterConfig))
  async addUser(@AppRequest() req: IAppRequest, @Body() body: UserAddDto, @UploadedFile() file) {
    try {
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.profilePhoto = file.filename;
      }

      return await this.userService.startInsertUser(req, params);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-user')
  @RequirePermission(CAPABILITIES.USER.UPDATE)
  @UseInterceptors(FileInterceptor('profilePhoto', imageMulterConfig))
  async updateUser(
    @AppRequest() req: IAppRequest,
    @Body() body: UserUpdateDto,
    @UploadedFile() file,
  ) {
    try {
      const params = body;
      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.profilePhoto = file.filename;
      }

      return await this.userService.startUpdateUser(req, params);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-user')
  @RequirePermission(CAPABILITIES.USER.DELETE)
  async deleteUser(@AppRequest() req: IAppRequest, @Query() query: UserDeleteDto) {
    return await this.userService.startDeleteUser(req, query);
  }

  @Get('get-user')
  @RequirePermission(CAPABILITIES.USER.VIEW)
  async getUser(@AppRequest() req: IAppRequest, @Query() query: UserDetailsDto) {
    return await this.userListService.startUserDetails(req, query);
  }

  @Post('list-user')
  @RequirePermission(CAPABILITIES.USER.LIST)
  async listUser(@AppRequest() req: IAppRequest, @Body() body: UserListDto) {
    return await this.userListService.startUserList(req, body);
  }
}
