import { IsIn, IsNotEmpty } from 'class-validator';

export class CommonFileDto {
  @IsNotEmpty()
  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
  file: string;
}
