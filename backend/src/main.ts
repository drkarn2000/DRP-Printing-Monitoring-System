import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger OpenAPI Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('DRP Printing Monitoring System API')
    .setDescription('Production-ready backend APIs for machine monitoring, production jobs, PrintExp, RIP workflow, inventory, costing and reports')
    .setVersion('2.0.0')
    .addBearerAuth()
    .addCookieAuth('drp_auth_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`=======================================================`);
  console.log(`  DRP Printing Monitoring System - NestJS Backend`);
  console.log(`  Server listening on: http://localhost:${port}`);
  console.log(`  Swagger API Docs:    http://localhost:${port}/api/docs`);
  console.log(`=======================================================`);
}
bootstrap();
