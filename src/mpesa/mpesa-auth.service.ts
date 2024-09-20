/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Buffer } from 'buffer';

@Injectable()
export class MpesaAuthService {
  constructor(private httpService: HttpService) {}

  async getAccessToken(): Promise<string> {
    const url = process.env.ACCESS_TOKEN_URL;
    const consumerKey = process.env.CONSUMER_KEY; 
    const consumerSecret = process.env.CONSUMER_SECRET; 

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const headers = {
      Authorization: `Basic ${auth}`,
    };

    const response = await firstValueFrom(this.httpService.get(url, { headers }));
    return response.data.access_token;
  }
}