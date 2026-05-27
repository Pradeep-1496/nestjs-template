import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/exception-filter';
import { Logger } from 'nestjs-pino';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  );

  // enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(','),
    methods: process.env.CORS_METHODS,
    credentials: true,
  });

  // enable pino logger
  app.useLogger(app.get(Logger));

  // apply validation and transform within global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // apply reponse wrapper interceptor and exception filter
  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger UI Doc
  const config = new DocumentBuilder()
    .setTitle('Support Ticket system example')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // app listen
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n\n\tApplication Running On http://localhost:${port}`);
  console.log(`\n\tSwagger UI running On http://localhost:${port}/api\n\n`);
}
bootstrap();
