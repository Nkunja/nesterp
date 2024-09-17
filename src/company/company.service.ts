/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MpesaService } from '../mpesa/mpesa.service';
import { Company } from '@prisma/client';

export interface LoginResponse {
  message: string;
  company: Company; // Use the Company type from Prisma
}

@Injectable()
export class CompanyService {
  constructor(
    private readonly mpesaService: MpesaService,
    private prisma: PrismaService
  ) {}

  async registerCompany(registerCompanyDto: RegisterCompanyDto): Promise<any> {
    // Save company details to the database with pending subscription status
    const company = await this.prisma.company.create({
      data: {
        name: registerCompanyDto.name,
        address: registerCompanyDto.address,
        owner: registerCompanyDto.owner,
        phoneNumber: registerCompanyDto.phoneNumber,
        location: registerCompanyDto.location,
        subscriptionStatus: 'pending', // Set initial status to pending
      },
    });

    const transactionId = await this.mpesaService.initiatePayment({
      phoneNumber: registerCompanyDto.phoneNumber,
      amount: registerCompanyDto.amount,
      accountReference: registerCompanyDto.name,
      transactionDesc: 'Company Registration Payment',
      companyId: company.id, // Add the companyId here
    });


    // Create transaction record
    await this.createTransaction(company.id, registerCompanyDto.amount, transactionId);

    // Wait for 45 seconds before checking payment status
    await this.delay(45000);

    // Check payment status
    const paymentStatus = await this.checkPaymentStatus(transactionId);
    
    // Update company status based on payment status
    if (paymentStatus === 'success') {
      await this.updateCompanyStatus(company.id, 'active');
    } else {
      await this.updateCompanyStatus(company.id, 'failed');
    }

    return { company, paymentStatus };
  }


  private async updateCompanyStatus(companyId: number, status: 'active' | 'failed') {
    await this.prisma.company.update({
      where: { id: companyId },
      data: { subscriptionStatus: status },
    });
  }

  //   // Update subscription status based on payment status
  //   if (paymentStatus === 'SUCCESS') {
  //     const subscriptionEnd = new Date();
  //     subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

  //     await this.prisma.company.update({
  //       where: { id: company.id },
  //       data: {
  //         subscriptionStatus: 'active', // Set status to active
  //         subscriptionEnd, // Set subscription end date
  //       },
  //     });
  //   } else {
  //     await this.prisma.company.update({
  //       where: { id: company.id },
  //       data: {
  //         subscriptionStatus: 'pending', // Ensure status is pending
  //       },
  //     });
  //   }

  //   return { message: 'Company registered successfully, awaiting payment confirmation.', company };
  // }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async checkPaymentStatus(transactionId: string): Promise<string> {
    // Call the MpesaService to check the payment status
    return await this.mpesaService.checkPaymentStatus(transactionId);
  }

  async confirmPayment(companyId: number): Promise<void> {
    // Update subscription status to active and set subscription end date
    const subscriptionEnd = new Date();
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionStatus: 'active', 
        subscriptionEnd, 
      },
    });
  }

  async createTransaction(companyId: number, amount: number, transactionId: string): Promise<void> {
    // Create a transaction record
    await this.prisma.transaction.create({
      data: {
        companyId,
        amount,
        transactionId
      },
    });

    // Update subscription end date to 1 year from now
    const subscriptionEnd = new Date();
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

    await this.prisma.company.update({
      where: { id: companyId },
      data: { subscriptionEnd },
    });
  }

  async handleMpesaPayment(paymentData: any): Promise<void> {
    // Extract necessary information from the paymentData
    const { companyId, status, amount } = paymentData;

    // Save the transaction details
    await this.prisma.transaction.create({
      data: {
        companyId,
        amount,
      },
    });

    // Update the company's subscription status based on the payment status
    if (status === 'SUCCESS') {
      const subscriptionEnd = new Date();
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

      await this.prisma.company.update({
        where: { id: companyId },
        data: {
          subscriptionStatus: 'active', // Set status to active
          subscriptionEnd, // Set subscription end date
        },
      });
    } else {
      await this.prisma.company.update({
        where: { id: companyId },
        data: {
          subscriptionStatus: 'pending', // Ensure status is pending
        },
      });
    }
}
  // async checkSubscriptionStatus(companyId: number): Promise<boolean> {
  //   const company = await this.prisma.company.findUnique({
  //     where: { id: companyId },
  //     select: { subscriptionEnd: true },
  //   });

  //   if (!company || !company.subscriptionEnd) {
  //     return false; // No subscription found
  //   }

  //   return new Date() < company.subscriptionEnd; // Check if current date is before subscription end date
  // }

  async checkSubscriptionStatus(companyId: number): Promise<boolean> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId }
    });
    return company?.subscriptionStatus === 'active';
  }

  async login(companyId: number): Promise<LoginResponse> {
    const isSubscribed = await this.checkSubscriptionStatus(companyId);
    
    if (!isSubscribed) {
      throw new Error('Subscription expired or not found.');
    }

    // Proceed with login logic (e.g., return company details)
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    return { message: 'Login successful', company }; // Return the company object
  }
}