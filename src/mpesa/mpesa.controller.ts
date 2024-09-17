/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { MpesaPaymentDto } from './dto/mpesa-payment.dto';

@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  @Post('payment')
  async initiatePayment(@Body() paymentData: MpesaPaymentDto) {
    const formattedPhoneNumber = this.formatPhoneNumber(paymentData.phoneNumber);

    const paymentRequest = {
      phoneNumber: formattedPhoneNumber,
      amount: paymentData.amount, 
      companyId: paymentData.companyId,
    };

    return this.mpesaService.initiatePayment(paymentRequest);
  }

  private formatPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('0')) {
      return '254' + phoneNumber.slice(1); 
    }
    return phoneNumber; 
  }

  @Get('payment/:transactionId')
  async getPaymentStatus(@Param('transactionId') transactionId: string): Promise<any> {
      return this.mpesaService.checkPaymentStatus(transactionId);
  }

}
