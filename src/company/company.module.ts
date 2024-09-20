/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MpesaModule } from 'src/mpesa/mpesa.module';

@Module({
  imports: [MpesaModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
