/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeesService } from '../employees/employees.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private employeesService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    return this.employeesService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }

  async login(loginDto: LoginDto) {
    const employee = await this.employeesService.findByEmail(loginDto.email);
    if (!employee || !(await bcrypt.compare(loginDto.password, employee.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: employee.email, sub: employee.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
