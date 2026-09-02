import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Rainy Days API')
    .setDescription('REST API serving the Rainy Days product catalogue and simulated checkout')
    .setVersion('1.0')
    .addTag('products')
    .addTag('orders')
    .addTag('health')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config), {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT ?? 8080);
  await app.listen(port);

  Logger.log(`API listening on http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger UI on http://localhost:${port}/api/docs`, 'Bootstrap');
}

void bootstrap();
