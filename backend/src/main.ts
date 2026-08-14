import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Admin panel (localhost:5173) için CORS
  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global exception filter — tüm hataları tutarlı JSON formatında döndürür
  app.useGlobalFilters(new AllExceptionsFilter());

  // DTO validasyonunu global olarak aktif et
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // DTO'da tanımsız alanları sil
      forbidNonWhitelisted: true, // Fazla alan gelirse 400 döndür
      transform: true,       // Gelen veriyi DTO tipine dönüştür
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Uygulama çalışıyor: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
