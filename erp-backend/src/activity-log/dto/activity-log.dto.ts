import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ActivityLogDetailsDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ActivityLogListDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  search?: string;

  @IsOptional()
  filters?: any[];

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  logicalOperator?: 'AND' | 'OR';
}

export class UserActivityLogDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  userId: number;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
