import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentMasterEntity } from './entity/attachment-master.entity';
import { AttachmentMasterService } from './service/attachment-master.service';
import { CommonFileService } from 'src/package/service/common-file.service';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentMasterEntity])],
  providers: [AttachmentMasterService, CommonFileService, GeneralUtilities],
  exports: [AttachmentMasterService, TypeOrmModule],
})
export class AttachmentMasterModule {}
