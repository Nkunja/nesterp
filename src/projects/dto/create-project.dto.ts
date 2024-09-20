/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  departmentId: number; 

  @IsNotEmpty()
  companyId: number;
}
