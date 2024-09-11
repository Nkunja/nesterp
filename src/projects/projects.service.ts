/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateProjectDto) {
    return this.prisma.project.create({ data });
  }

  findAll() {
    return this.prisma.project.findMany();
  }

  findOne(id: number) {
    return this.prisma.project.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateProjectDto) {
    return this.prisma.project.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.project.delete({ where: { id } });
  }
}