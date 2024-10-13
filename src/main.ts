import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const PORT = configService.get<string>('port') || 5000;
    const configSwagger = new DocumentBuilder()
        .setTitle('Bots API')
        .setDescription('API к ботам для удобного взаимодействия')
        .setVersion('1.0')
        .addTag('api')
        .build();
    const document = SwaggerModule.createDocument(app, configSwagger);
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.use(bodyParser.json({ limit: '10mb' }));
    SwaggerModule.setup('api', app, document);
    await app.listen(PORT);
}
bootstrap();
