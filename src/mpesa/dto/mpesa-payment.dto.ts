/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class MpesaPaymentDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string; 
  @IsString()
  @IsNotEmpty()
  amount: number; 
  transactionType: string; 
  businessShortCode: string; 
  callbackUrl: string; 
}