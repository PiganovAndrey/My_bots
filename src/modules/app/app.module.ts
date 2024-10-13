import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../../config/winston.config';
import config from 'src/config/configuration';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { LoggingInterceptor } from 'src/common/interceptors/LoggingInterceptor';
import { TaskModule } from '../task/task.module';
import { SubjectModule } from '../subject/subject.module';

@Module({
    imports: [
        DatabaseModule,
        TaskModule,
        SubjectModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config]
        }),
        WinstonModule.forRoot({
            transports: winstonConfig.transports,
            format: winstonConfig.format,
            level: winstonConfig.level
        })
    ],
    providers: [Reflector, { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }]
})
export class AppModule {}
