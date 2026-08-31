import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe(
    { 
      whitelist: true,  //elimina propiedades no permitidas
      transform: true  //convierte el request al tipo definido
    }
  ));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
