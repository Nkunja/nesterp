/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class MpesaPaymentDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string; 

  @IsString()
  @IsNotEmpty()
  amount: number; 

  @IsNumber()
  companyId: number;

  transactionType: string; 

  businessShortCode: string; 
  
  callbackUrl: string; 
}

