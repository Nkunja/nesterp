/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MpesaAuthService } from './mpesa-auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AxiosError } from 'axios';

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
  //   // Ensure the MPESA_CALLBACK_URL doesn't end with a slash
  //   const baseUrl = process.env.MPESA_CALLBACK_URL?.replace(/\/$/, '');
  //   const url = `${baseUrl}/mpesa/payment/${transactionId}`;

  //   this.logger.log(`Checking payment status for transaction: ${transactionId}`);
  //   this.logger.log(`URL: ${url}`);

  //   try {
  //       const token = await this.mpesaAuthService.getAccessToken();

  //       const headers = {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //       };

  //       const response = await firstValueFrom(this.httpService.get(url, { headers, timeout: 20000 }));

  //       this.logger.log(`Payment status response: ${JSON.stringify(response.data)}`);

  //       const resultCode = response.data?.Body?.stkCallback?.ResultCode;

  //       // Check ResultCode: 0 indicates success, otherwise it's a failure
  //       if (resultCode === 0) {
  //           return 'success';
  //       } else {
  //           return 'fail';
  //       }

      
  //     } catch (error) {
  //         // Check if error is an instance of Error
  //         if (error instanceof Error) {
  //             this.logger.error(`Error checking payment status: ${error.message}`, error.stack);
  //         } else {
  //             this.logger.error('An unknown error occurred while checking payment status.');
  //         }
  //         return 'failed';
  //     }
  // }

  async checkPaymentStatus(transactionId: string): Promise<string> {
    try {
      const token = await this.mpesaAuthService.getAccessToken();

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Use the actual M-Pesa API endpoint here
      const mpesaApiUrl = `https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query`;
  

      const payload = {
        BusinessShortCode: process.env.BUSINESS_SHORTCODE,
        Password: this.generatePassword,
        Timestamp: new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3),
        CheckoutRequestID: transactionId
      };

      const response = await firstValueFrom(
        this.httpService.post(mpesaApiUrl, payload, { headers, timeout: 20000 })
      );

      this.logger.log(`Payment status response: ${JSON.stringify(response.data)}`);

      const resultCode = response.data?.ResultCode;

      return resultCode === 0 ? 'success' : 'fail';
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Error checking payment status: ${error.message}`, error.stack);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
          this.logger.error(`Response status: ${error.response.status}`);
        } else if (error.request) {
          // The request was made but no response was received
          this.logger.error('No response received', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          this.logger.error('Error setting up request', error.message);
        }
      } else {
        this.logger.error('An unknown error occurred while checking payment status.', error);
      }
      return 'failed';
    }
  }
}
