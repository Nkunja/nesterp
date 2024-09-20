/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  departmentId: number; 

  @IsNumber()
  @IsNotEmpty()
  companyId: number; 
}