import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  
} from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

import {
  CreateCapabilityDto,
  UpdateCapabilityDto,
  DeleteCapabilityDto,
  GetCapabilityDto,
  ListCapabilitiesDto,
} from './dto/capability.dto';

import { CapabilityService } from './service/capability.service';
import { CapabilityListService } from './service/capability.list.service';

@Controller('capability')
export class CapabilityController {
  constructor(
    private readonly capabilityService: CapabilityService,
    private readonly capabilityListService: CapabilityListService,
  ) { }

  @Post('add-capability')
  async addCapability(@AppRequest() req: IAppRequest, @Body() body: CreateCapabilityDto) {
    return await this.capabilityService.startInsertCapability(req, body);
  }

  @Put('update-capability')
  async updateCapability(@AppRequest() req: IAppRequest, @Body() body: UpdateCapabilityDto) {
    return await this.capabilityService.startUpdateCapability(req, body);
  }

  @Delete('delete-capability')
  async deleteCapability(@AppRequest() req: IAppRequest, @Query() query: DeleteCapabilityDto) {
    return await this.capabilityService.startDeleteCapability(req, query);
  }

  @Get('get-capability')
  async getCapability(@Query() query: GetCapabilityDto) {
    return await this.capabilityListService.startCapabilityDetails(query);
  }

  @Post('list-capabilities')
  async listCapabilities(@AppRequest() req: IAppRequest, @Body() body: ListCapabilitiesDto) {
    return await this.capabilityListService.startCapabilityList(req, body);
  }
}
