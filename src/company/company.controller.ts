/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RegisterCompanyDto } from './dto/register-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('register')
  async register(@Body() registerCompanyDto: RegisterCompanyDto) {
    return this.companyService.registerCompany(registerCompanyDto);
  }

  @Post('login')
  async login(@Body('companyId') companyId: number) {
    return this.companyService.login(companyId);
  }

  @Post('transaction')
  async createTransaction(@Body('companyId') companyId: number, @Body('amount') amount: number) {
    await this.companyService.createTransaction(companyId, amount);
    return { message: 'Transaction created and subscription updated successfully' };
  }

  @Post('check-subscription')
  async checkSubscription(@Body('companyId') companyId: number) {
    const isSubscribed = await this.companyService.checkSubscriptionStatus(companyId);
    return { isSubscribed };
  }

  @Post('confirm-payment')
  async confirmPayment(@Body('companyId') companyId: number) {
    await this.companyService.confirmPayment(companyId);
    return { message: 'Payment confirmed and subscription activated.' };
  }

  @Post('mpesa-webhook')
  async mpesaWebhook(@Body() paymentData: any) {
    return this.companyService.handleMpesaPayment(paymentData);
  }
}