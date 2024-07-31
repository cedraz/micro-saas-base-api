import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Micro SaaS')
    .setDescription('Micro SaaS Base API docs')
    .setVersion('1.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);

  const port = configService.get<string>('PORT');

  await app.listen(port);
  console.log(`
    API runing on http://localhost:${port}
    DOCS runing on http://localhost:${port}/docs
  `);
}
bootstrap();
