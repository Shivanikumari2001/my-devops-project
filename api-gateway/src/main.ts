import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.useGlobalPipes(new ValidationPipe());
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`API Gateway is running on port ${port}`);
    console.log(`Health check available at http://0.0.0.0:${port}/health`);
  } catch (error) {
    console.error('Error starting API Gateway:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Unhandled error in bootstrap:', error);
  process.exit(1);
});

