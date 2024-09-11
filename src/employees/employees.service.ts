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
    return this.prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
        // Do not include password here
      },
    });
  }

  findOne(id: number) {
    return this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
        // Do not include password here
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true, // Include password for authentication
        departmentId: true,
      },
    });
  }

  update(id: number, data: UpdateEmployeeDto) {
    return this.prisma.employee.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.employee.delete({ where: { id } });
  }
}