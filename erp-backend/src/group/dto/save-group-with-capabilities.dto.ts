import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsIn,
} from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  @IsIn(['Active', 'InActive'])
  status: string;

  @IsArray()
  @IsString({ each: true })
  capabilityCodes: string[];
}
