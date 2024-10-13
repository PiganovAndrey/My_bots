import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    LoggerService,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggingInterceptor } from 'src/common/interceptors/LoggingInterceptor';
import { SubjectService } from './subject.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@ApiTags('Subject')
@Controller('subject')
@UseInterceptors(LoggingInterceptor)
export class SubjectController {
    constructor(
        private readonly subjectService: SubjectService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
    ) {}

    @Get('/')
    @ApiOperation({ summary: 'Позволяет получить предметы созданные в базе данных' })
    @ApiResponse({ status: 200, description: 'Возвращает предметы' })
    getAllSubjects() {
        try {
            return this.subjectService.getAllSubjects();
        } catch (e) {
            this.logger.error(`Error in subjectController:\n${e}`);
            throw new HttpException('Ошибка при получении всех предметов', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Позволяет получить предмет по id' })
    @ApiResponse({ status: 200, description: 'Возвращает предмет из бд по id' })
    getSubjectById(@Param('id', ParseIntPipe) id: number) {
        try {
            return this.subjectService.getSubjectById(id);
        } catch (e) {
            this.logger.error(`Error in subjectControler:\n${e}`);
            throw new HttpException('Ошибка при получении предмета по id', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/')
    @ApiOperation({ summary: 'Позволяет создавать предметы' })
    @ApiBody({ type: CreateSubjectDto, description: 'Пример данных для создания' })
    @ApiResponse({ status: 201, description: 'Возвращает созданный предмет' })
    createSubject(@Body() dto: CreateSubjectDto) {
        try {
            return this.subjectService.createSubject(dto);
        } catch (e) {
            this.logger.error(`Error in subjectController:\n${e}`);
            throw new HttpException('Ошибка при создании предмета', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/')
    @ApiOperation({ summary: 'Позволяет обновить предмет' })
    @ApiBody({ type: UpdateSubjectDto, description: 'Пример данных для обновления' })
    @ApiResponse({ status: 200, description: 'Возвращает обновленный предмет' })
    updateSubject(@Body() dto: UpdateSubjectDto) {
        try {
            return this.subjectService.updateSubjectById(dto);
        } catch (e) {
            this.logger.error(`Error in subjectController:\n${e}`);
            throw new HttpException('Ошибка при обновлении предмета', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Позволяет удалить предмет' })
    @ApiResponse({ status: 200, description: 'Возвращает статус об удаленности предмета' })
    deleteSubject(@Param('id', ParseIntPipe) id: number) {
        try {
            return this.subjectService.deleteSubjectById(id);
        } catch (e) {
            this.logger.error(`Error in subjectController:\n${e}`);
            throw new HttpException('Ошибка при удалении предмета', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
