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
import { TaskService } from './task.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Task')
@Controller('task')
@UseInterceptors(LoggingInterceptor)
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
    ) {}

    @Get('/')
    @ApiOperation({ summary: 'Позволяет получить все задачи созданные в базе данных' })
    @ApiResponse({ status: 200, description: 'Возвращает задачи' })
    getAllTasks() {
        try {
            return this.taskService.getAllTasks();
        } catch (e) {
            this.logger.error(`Error in taskController:\n${e}`);
            throw new HttpException('Ошибка при получении всех задач', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Позволяет получить задачу по id' })
    @ApiResponse({ status: 200, description: 'Возвращает задачу из бд по id' })
    getTaskById(@Param('id', ParseIntPipe) id: number) {
        try {
            return this.taskService.getTaskById(id);
        } catch (e) {
            this.logger.error(`Error in subjectControler:\n${e}`);
            throw new HttpException('Ошибка при получении предмета по id', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/')
    @ApiOperation({ summary: 'Позволяет создоавть задачи' })
    @ApiBody({ type: CreateTaskDto, description: 'Пример данных для создания' })
    @ApiResponse({ status: 201, description: 'Возвращает созданную задачу' })
    createTask(@Body() dto: CreateTaskDto) {
        try {
            return this.taskService.createTask(dto);
        } catch (e) {
            this.logger.error(`Error in taskController:\n${e}`);
            throw new HttpException('Ошибка при создании задачи', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/')
    @ApiOperation({ summary: 'Позволяет обновить задачу(время и предмет)' })
    @ApiBody({ type: UpdateTaskDto, description: 'Пример данных для обновления' })
    @ApiResponse({ status: 200, description: 'Возвращает обновленную задачу' })
    updateTask(@Body() dto: UpdateTaskDto) {
        try {
            return this.taskService.updateTaskById(dto);
        } catch (e) {
            this.logger.error(`Error in taskController:\n${e}`);
            throw new HttpException('Ошибка при обновлении задачи', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('/')
    @ApiOperation({ summary: 'Позволяет удалить задачу' })
    @ApiResponse({ status: 200, description: 'Возвращает статус об удаленности задачи' })
    deleteTask(@Param('id', ParseIntPipe) id: number) {
        try {
            return this.taskService.deleteTaskById(id);
        } catch (e) {
            this.logger.error(`Error in tasktController:\n${e}`);
            throw new HttpException('Ошибка при удалении задачи', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
