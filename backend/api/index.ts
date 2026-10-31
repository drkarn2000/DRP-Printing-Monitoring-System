import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const server = express();
let isAppInitialized = false;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('DRP Printing Monitoring System API')
    .setDescription('Production-ready backend APIs for machine monitoring, production jobs, PrintExp, RIP workflow, inventory, costing and reports')
    .setVersion('2.0.0')
    .addBearerAuth()
    .addCookieAuth('drp_auth_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  isAppInitialized = true;
}

export default async function handler(req: any, res: any) {
  if (!isAppInitialized) {
    await bootstrap();
  }
  server(req, res);
}
