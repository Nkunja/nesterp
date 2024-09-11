/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma } from '@prisma/client'; // Import Prisma namespace

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateTaskDto) {
    const taskData: Prisma.TaskCreateInput = { 
      title: data.title,
      project: { connect: { id: data.projectId } }, 
      assignedTo: data.employeeId ? { connect: { id: data.employeeId } } : undefined,
      status: data.status || 'pending',
    };

    return this.prisma.task.create({
      data: taskData,
    });
  }

  findAll() {
    return this.prisma.task.findMany();
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateTaskDto) {
    return this.prisma.task.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}