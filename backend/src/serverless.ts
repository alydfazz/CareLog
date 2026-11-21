import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

let cachedApp: any;

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      const app = await NestFactory.create(AppModule);

      app.enableCors({
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
      });

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
        }),
      );

      await app.init();
      cachedApp = app.getHttpAdapter().getInstance();
    }

    return cachedApp(req, res);
  } catch (error: any) {
    console.error('Serverless error:', error);
    return res.status(500).json({
      message: error?.message || 'Unknown error',
      stack: error?.stack,
    });
  }
}