/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { DepartmentsModule } from './departments/departments.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CompanyModule } from './company/company.module';
import { MpesaService } from './mpesa/mpesa.service';
import { MpesaModule } from './mpesa/mpesa.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    EmployeesModule, 
    PrismaModule, 
    DepartmentsModule, 
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || '1qwsdffgtrr3455467.',
      signOptions: { expiresIn: '60s' },
    }),
    ProjectsModule,
    TasksModule,
    CompanyModule,
    HttpModule,
    MpesaModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, MpesaService],
})
export class AppModule {}


