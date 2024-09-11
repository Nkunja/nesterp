/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty() // Ensure this is required
  projectId: number;

  @IsNumber()
  employeeId?: number; // Optional
  status?: string;
}