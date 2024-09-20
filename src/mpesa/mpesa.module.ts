/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { MpesaController } from './mpesa.controller';
import { HttpModule } from '@nestjs/axios';
import { MpesaAuthService } from './mpesa-auth.service';

@Module({
  imports: [HttpModule],
  controllers: [MpesaController],
  providers: [MpesaService, MpesaAuthService],
  exports: [MpesaAuthService, MpesaService]
})
export class MpesaModule {}