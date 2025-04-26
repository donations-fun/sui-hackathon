import { NestFactory } from '@nestjs/core';
import { DonateProcessorModule } from './donate.processor.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';
import { ApiConfigService } from '@monorepo/common/config/api.config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(DonateProcessorModule);

  app.useGlobalPipes(new ValidationPipe());

  const apiConfigService = app.get<ApiConfigService>(ApiConfigService);
  app.enableCors({
    origin: apiConfigService.getCorsOrigin(),
    maxAge: 3600,
  });
  app.set('trust proxy', 1);

  if (process.env?.NODE_ENV === 'development') {
    const config = new DocumentBuilder().setTitle('donations.fun-sui-microservice').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('', app, document);
  }

  await app.listen(3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
