import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

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
import { multerConfig } from 'src/package/config/multer.config';
import { CommonFileDto } from 'src/package/dto/common-file.dto';
import { CommonFileService } from 'src/package/service/common-file.service';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userListService: UserListService,
    private readonly commonFileService: CommonFileService,
  ) {}

  @Post('add-user')
  @RequirePermission('USER_CREATE')
  @UseInterceptors(FileInterceptor('profilePhoto', multerConfig))
  async addUser(@Req() req, @Body() body: UserAddDto, @UploadedFile() file) {
    try {
      const params = body;

      if (file) {
        const fileDto = new CommonFileDto();

        fileDto.file = file.mimetype;

        const errors = await validate(fileDto);

        if (errors.length > 0) {
          await this.commonFileService.deleteTempFile(file.filename);

          return {
            success: 0,
            message: 'Invalid File',
          };
        }

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
  @RequirePermission('USER_UPDATE')
  @UseInterceptors(FileInterceptor('profilePhoto', multerConfig))
  async updateUser(
    @Req() req,
    @Body() body: UserUpdateDto,
    @UploadedFile() file,
  ) {
    try {
      const params = body;
      if (file) {
        const fileDto = new CommonFileDto();

        fileDto.file = file.mimetype;

        const errors = await validate(fileDto);

        if (errors.length > 0) {
          await this.commonFileService.deleteTempFile(file.filename);

          return {
            success: 0,
            message: 'Invalid File',
          };
        }

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
  @RequirePermission('USER_DELETE')
  async deleteUser(@Req() req, @Query() query: UserDeleteDto) {
    return await this.userService.startDeleteUser(req, query);
  }

  @Get('get-user')
  @RequirePermission('USER_VIEW')
  async getUser(@Req() req, @Query() query: UserDetailsDto) {
    return await this.userListService.startUserDetails(req, query);
  }

  @Post('list-user')
  @RequirePermission('USER_LIST')
  async listUser(@Req() req, @Body() body: UserListDto) {
    return await this.userListService.startUserList(req, body);
  }
}

