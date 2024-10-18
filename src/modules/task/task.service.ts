import { Injectable, LoggerService, OnModuleInit, NotFoundException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CreateTaskDto } from './dto/create-task.dto';
import { tasks } from '@prisma/client';
import { SuccessResponse } from 'src/common/response/success.response';
import { UpdateTaskDto } from './dto/update-task.dto';
import * as cron from 'node-cron';
import startOdinOnline from 'scripts/odinOnlineBot';
import startZoomClass from 'scripts/runZoomBot';
import { TaskWithSubject } from './dto/taskWithSubject';
import runWithRetries from '../../utils/runWithRetries';

@Injectable()
export class TaskService implements OnModuleInit {
    private readonly jobs: Map<number, cron.ScheduledTask> = new Map(); // Хранение запланированных задач

    constructor(
        private readonly prisma: DatabaseService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
    ) {}

    async onModuleInit() {
        // Загружаем и планируем задачи из базы данных при инициализации модуля
        await this.loadScheduledTasks();
    }

    async getAllTasks(): Promise<tasks[]> {
        try {
            this.logger.log('Fetching all tasks', TaskService.name);
            return await this.prisma.tasks.findMany({ take: 100 });
        } catch (error) {
            this.logger.error('Error fetching all tasks', error);
            throw error;
        }
    }

    async getTaskById(id: number): Promise<tasks> {
        try {
            this.logger.log('Fetching task by id', TaskService.name);
            return await this.prisma.tasks.findFirst({ where: { id } });
        } catch (error) {
            this.logger.error('Error fetching task by id', error);
            throw error;
        }
    }

    // Загружаем задачи из базы данных и создаем cron-задачи
    async loadScheduledTasks() {
        const tasks = await this.prisma.tasks.findMany({ include: { subject: true } });
        for (const task of tasks) {
            this.scheduleTask(task);
        }
    }

    // Метод для создания новой задачи
    async createTask(dto: CreateTaskDto): Promise<tasks> {
        try {
            this.logger.log('Начинается создание задачи');

            const data: any = {
                start_time: new Date(dto.start_time), // Преобразование строки в дату
                types: dto.types
            };

            if (dto.subjectId) {
                data.subject = { connect: { id: dto.subjectId } };
            }

            const task = await this.prisma.tasks.create({
                data,
                include: { subject: true }
            });

            // Запланировать cron-задачу для новой задачи
            this.scheduleTask(task);

            this.logger.log('Задача успешно создана');
            return task;
        } catch (error) {
            this.logger.error('Ошибка в методе создания задачи', error);
            throw error;
        }
    }

    // Метод для обновления задачи
    async updateTaskById(dto: UpdateTaskDto): Promise<tasks> {
        try {
            this.logger.log(`Обновление задачи с id: ${dto.id}`, TaskService.name);
            const task = await this.prisma.tasks.findFirst({ where: { id: dto.id } });

            if (!task) {
                this.logger.warn(`Задача не найдена для id: ${dto.id}`, TaskService.name);
                throw new NotFoundException('Задача с данным id не найдена');
            }

            const newTask = await this.prisma.tasks.update({
                where: { id: dto.id },
                data: { subject_id: dto.subjectId, start_time: dto.start_time },
                include: { subject: true }
            });

            // Перезапланировать задачу, если она уже была
            const existingJob = this.jobs.get(dto.id);
            if (existingJob) {
                existingJob.stop(); // Останавливаем старую задачу
                this.jobs.delete(dto.id); // Удаляем из Map
            }

            // Запланировать новую cron-задачу для обновленной задачи
            this.scheduleTask(newTask);

            return newTask;
        } catch (error) {
            this.logger.error('Ошибка в методе обновления задачи', error);
            throw error;
        }
    }

    // Метод для удаления задачи
    async deleteTaskById(id: number): Promise<SuccessResponse> {
        try {
            this.logger.log('Удаление задачи с id', TaskService.name);
            const task = await this.prisma.tasks.findFirst({ where: { id } });

            if (!task) {
                this.logger.warn(`Задача не найдена для id: ${id}`, TaskService.name);
                throw new NotFoundException('Задачи с данным id не найдено');
            }

            await this.prisma.tasks.delete({ where: { id } });

            // Останавливаем и удаляем cron-задачу
            const existingJob = this.jobs.get(id);
            if (existingJob) {
                existingJob.stop(); // Останавливаем задачу
                this.jobs.delete(id); // Удаляем из Map
            }

            this.logger.log(`Задача успешно удалена для id: ${id}`, TaskService.name);
            return { success: true };
        } catch (error) {
            this.logger.error('Ошибка в методе удаления задачи', error);
            throw error;
        }
    }

    // Планирование cron-задачи
    private scheduleTask(task: TaskWithSubject) {
        const startTime = new Date(task.start_time);
        const cronExpression = this.generateCronExpression(startTime);

        // Планируем задачу по крон-выражению
        const job = cron.schedule(cronExpression, async () => {
            this.logger.log(`Выполнение задачи с id ${task.id}`);
            await this.executeTask(task);
        });

        job.start(); // Запускаем cron-задачу
        this.jobs.set(task.id, job); // Сохраняем задачу в Map

        this.logger.log(
            `Задача с id: ${task.id} запланирована на ${startTime}, cron - ${cronExpression}`,
            TaskService.name
        );
    }

    // Генерация крон-выражения для задачи на основе start_time
    private generateCronExpression(startTime: Date): string {
        const minutes = startTime.getMinutes();
        const hours = startTime.getHours();
        const dayOfWeek = startTime.getDay(); // день недели (0 - воскресенье, 6 - суббота)

        // Формируем крон-выражение вида: "минуты часы * * день_недели"
        return `${minutes} ${hours} * * ${dayOfWeek}`;
    }

    // Логика выполнения задачи
    private async executeTask(task: TaskWithSubject) {
        try {
            this.logger.log(`Выполняется задача ${task.id} с типами: ${task.types}`);

            // Проходим по каждому типу бота в задаче
            for (const type of task.types) {
                switch (type) {
                    case 'ODIN':
                        this.logger.log(`Запуск скрипта для Odin бота для задачи ${task.id}`);
                        await startOdinOnline();
                        break;

                    case 'ZOOM':
                        this.logger.log(`Запуск скрипта для Zoom конференции для задачи ${task.id}`);
                        await runWithRetries(() => startZoomClass(task.subject.link, task.subject.name));
                        break;

                    default:
                        this.logger.warn(`Неизвестный тип бота: ${type} для задачи ${task.id}`);
                        break;
                }
            }

            this.logger.log(`Задача ${task.id} успешно выполнена.`);
        } catch (error) {
            this.logger.error(`Ошибка при выполнении задачи ${task.id}`, error);
        }
    }
}
