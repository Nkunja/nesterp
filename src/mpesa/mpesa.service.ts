/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MpesaAuthService } from './mpesa-auth.service';

@Injectable()
export class MpesaService {
  constructor(private httpService: HttpService, private mpesaAuthService: MpesaAuthService) {}

  async initiatePayment(data: any): Promise<any> {
    const url = process.env.MPESA_PAYMENT_URL;
    const token = await this.mpesaAuthService.getAccessToken(); // Get the access token


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
      return response.data;
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

  async checkPaymentStatus(transactionId: string): Promise<string> {
    const url = `${process.env.MPESA_PAYMENT_STATUS_URL}/mpesa/payment/${transactionId}`; // Replace with the correct endpoint
    const token = await this.mpesaAuthService.getAccessToken(); // Get the access token

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(this.httpService.get(url, { headers }));
      return response.data.status; // Adjust based on the actual response structure
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error; // Handle the error as needed
    }
  }
}