/* eslint-disable prettier/prettier */
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  
  const config = new DocumentBuilder()
    .setTitle('Employee Management API')
    .setDescription('API for managing employees, departments, projects, and tasks')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  await app.listen(3006);
}
bootstrap();

