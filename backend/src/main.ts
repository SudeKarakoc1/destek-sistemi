import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
