/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MpesaService } from './mpesa.service';
import { MpesaAuthService } from './mpesa-auth.service';
import { HttpService } from '@nestjs/axios';

describe('MpesaService', () => {
  let service: MpesaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MpesaService, MpesaAuthService, HttpService],
    }).compile();

    service = module.get<MpesaService>(MpesaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
