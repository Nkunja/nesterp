/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDepartmentDto) {
    return this.prisma.department.create({ data });
  }

  findAll() {
    return this.prisma.department.findMany();
  }

  findOne(id: number) {
    return this.prisma.department.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateDepartmentDto) {
    return this.prisma.department.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.department.delete({ where: { id } });
  }
}