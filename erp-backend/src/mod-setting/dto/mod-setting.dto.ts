import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Status } from 'src/package/common/enums/enum';

export class ModSettingAddDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status;
}

export class ModSettingUpdateDto extends ModSettingAddDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ModSettingDeleteDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ModSettingDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ModSettingListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page: number;
    
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number;
    
  @IsOptional()
  @IsString()
  search: string;
    
  @IsOptional()
  @IsString()
  sortField?: string;
    
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
