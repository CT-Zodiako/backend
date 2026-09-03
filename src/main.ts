import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EAFI API')
    .setDescription('API de categorías, períodos, ediciones y proyectos')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
  });

  app.useGlobalPipes(new ValidationPipe(
    { 
      whitelist: true,  //elimina propiedades no permitidas
      transform: true  //convierte el request al tipo definido
    }
  ));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
