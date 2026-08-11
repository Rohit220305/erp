import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Status } from 'src/package/common/enums/status.enum';

export class SaveGroupWithCapabilitiesDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  id?: number;

  @IsString()
  @IsNotEmpty()
  groupName: string;

  @IsString()
  @IsNotEmpty()
  groupCode: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;

  @IsArray()
  @IsString({ each: true })
  capabilityCodes: string[];
}
