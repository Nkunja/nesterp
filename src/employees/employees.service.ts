/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateEmployeeDto) {
    return this.prisma.employee.create({ data });
  }

  findAll() {
    return this.prisma.employee.findMany();
  }

  findOne(id: number) {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateEmployeeDto) {
    return this.prisma.employee.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.employee.delete({ where: { id } });
  }
}