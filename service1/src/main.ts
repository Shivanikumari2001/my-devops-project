import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // HTTP server
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const httpPort = process.env.HTTP_PORT || 3001;
  await app.listen(httpPort, '0.0.0.0');
  console.log(`Service1 HTTP is running on port ${httpPort}`);

  // TCP microservice
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.TCP_PORT || '3003'),
    },
  });

  await app.startAllMicroservices();
  console.log(`Service1 TCP microservice is running on port: ${process.env.TCP_PORT || '3003'}`);
}
bootstrap();

