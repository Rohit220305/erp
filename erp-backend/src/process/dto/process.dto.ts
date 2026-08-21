import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProcessAddDto {
  @IsString()
  processName: string;

  @IsString()
  @IsOptional()
  processCode: string;

  @IsNumber()
  @Type(() => Number)
  workCentreId: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsOptional()
  status: string;

  @IsOptional()
  imageUrl: string;

  @IsOptional()
  instructionPdfUrl: string;
}

export class ProcessUpdateDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsString()
  @IsOptional()
  processName: string;

  @IsString()
  @IsOptional()
  processCode: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  workCentreId: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  companyId: number;

  @IsString()
  @IsOptional()
  status: string;

  @IsOptional()
  imageUrl: string;

  @IsOptional()
  instructionPdfUrl: string;
}

export class ProcessDeleteDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ProcessDetailsDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;
}

export class ProcessListDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsString()
  @IsOptional()
  sortColumn: string;

  @IsString()
  @IsOptional()
  sortOrder: string;

  @IsString()
  @IsOptional()
  searchText: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  companyId: number;
}
