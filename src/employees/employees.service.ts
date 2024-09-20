/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  // create(data: CreateEmployeeDto) {
  //   return this.prisma.employee.create({ data });
  // }
  async create(data: CreateEmployeeDto) {
    // Fetch the role ID for "employee"
    const role = await this.prisma.role.findUnique({
      where: { name: 'employee' },
    });
  
    return this.prisma.employee.create({
      data: {
        ...data,
        roleId: role.id, // Set the default role ID
      },
    });
  }

  // findAll() {
  //   return this.prisma.employee.findMany({
  //     select: {
  //       id: true,
  //       name: true,
  //       email: true,
  //       departmentId: true,
  //       // Do not include password here
  //     },
  //   });
  // }

  findAll(companyId: number) {
    return this.prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
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

  // async findByEmail(email: string) {
  //   return this.prisma.employee.findUnique({
  //     where: { email },
  //     select: {
  //       id: true,
  //       name: true,
  //       email: true,
  //       password: true, // Include password for authentication
  //       departmentId: true,
  //     },
  //   });
  // }

  async findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        departmentId: true,
        companyId: true, // Add this line
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