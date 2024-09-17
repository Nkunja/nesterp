/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MpesaAuthService } from './mpesa-auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);


  constructor(
    private httpService: HttpService, 
    private mpesaAuthService: MpesaAuthService,
    private prisma: PrismaService
  ) {}


  async initiatePayment(data: {
    amount: number;
    phoneNumber: string;
    accountReference?: string;
    transactionDesc?: string;
    companyId: number;
  }): Promise<string> {
    const url = process.env.MPESA_PAYMENT_URL;
    const token = await this.mpesaAuthService.getAccessToken();

    const shortcode = process.env.BUSINESS_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const timestamp = this.getTimestamp();
    const password = this.generatePassword(shortcode, passkey, timestamp);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const paymentRequest = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: data.amount,
      PartyA: data.phoneNumber,
      PartyB: shortcode,
      PhoneNumber: data.phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: data.accountReference || 'Sir Nkunja',
      TransactionDesc: data.transactionDesc || 'Payment',
    };

    try {
      const response = await firstValueFrom(this.httpService.post(url, paymentRequest, { headers }));
      
      // Extract the transactionId from the response
      // Adjust the field name based on the actual M-Pesa API response
      const transactionId = response.data.CheckoutRequestID;

      if (!transactionId) {
        throw new Error('Transaction ID not found in M-Pesa response');
      }

      // Save the transaction to the database
      await this.prisma.transaction.create({
        data: {
          companyId: data.companyId,
          amount: data.amount,
          transactionId: transactionId,
        },
      });

      return transactionId;
    } catch (error) {
      const axiosError = error as any;
      console.error('Error initiating payment:', axiosError.response?.data || axiosError.message);
      throw error; // Rethrow or handle the error as needed
    }
  }


  private getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`; // Format: YYYYMMDDHHMMSS
  }

  private generatePassword(shortcode: string, passkey: string, timestamp: string): string {
    const password = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(password).toString('base64'); // Base64 encode
  }

  // async checkPaymentStatus(transactionId: string): Promise<string> {
  //   const url = `${process.env.MPESA_CALLBACK_URL}/mpesa/payment/${transactionId}`; // Replace with the correct endpoint
  //   const token = await this.mpesaAuthService.getAccessToken(); // Get the access token

  //   const headers = {
  //     Authorization: `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   };

  //   try {
  //     const response = await firstValueFrom(this.httpService.get(url, { headers }));
  //     return response.data.status; // Adjust based on the actual response structure
  //   } catch (error) {
  //     console.error('Error checking payment status:', error);
  //     throw error; // Handle the error as needed
  //   }
  // }

  async checkPaymentStatus(transactionId: string): Promise<string> {
    // Ensure the MPESA_CALLBACK_URL doesn't end with a slash
    const baseUrl = process.env.MPESA_CALLBACK_URL?.replace(/\/$/, '');
    const url = `${baseUrl}/mpesa/payment/${transactionId}`;

    this.logger.log(`Checking payment status for transaction: ${transactionId}`);
    this.logger.log(`URL: ${url}`);

    try {
        const token = await this.mpesaAuthService.getAccessToken();

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        const response = await firstValueFrom(this.httpService.get(url, { headers }));

        this.logger.log(`Payment status response: ${JSON.stringify(response.data)}`);

        const resultCode = response.data?.Body?.stkCallback?.ResultCode;

        // Check ResultCode: 0 indicates success, otherwise it's a failure
        if (resultCode === 0) {
            return 'success';
        } else {
            return 'fail';
        }

      
      } catch (error) {
          // Check if error is an instance of Error
          if (error instanceof Error) {
              this.logger.error(`Error checking payment status: ${error.message}`, error.stack);
          } else {
              this.logger.error('An unknown error occurred while checking payment status.');
          }
          return 'failed';
      }
}


  // async checkPaymentStatus(transactionId: string): Promise<string> {
  //   // Ensure the MPESA_CALLBACK_URL doesn't end with a slash
  //   const baseUrl = process.env.MPESA_CALLBACK_URL?.replace(/\/$/, '');
  //   const url = `${baseUrl}/mpesa/payment/${transactionId}`;

  //   this.logger.log(`Checking payment status for transaction: ${transactionId}`);
  //   this.logger.log(`URL: ${url}`);

  //   try {
  //     const token = await this.mpesaAuthService.getAccessToken();

  //     const headers = {
  //       Authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     };

  //     const response = await firstValueFrom(this.httpService.get(url, { headers }));

  //     this.logger.log(`Payment status response: ${JSON.stringify(response.data)}`);

  //     // Assuming the response contains a 'status' field
  //     return response.data.status || 'unknown';
  //   } catch (error) {
  //     this.logger.error(`Error checking payment status: ${error.message}`, error.stack);
  //     return 'failed';
  //  }
  // }
}