import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Id предмета для которой будет выполняться задача',
        example: '2'
    })
    @IsOptional()
    @IsInt()
    subjectId: number;

    @ApiProperty({
        description: 'Время начала задачи',
        example: 'Время в String'
    })
    @IsDateString()
    @IsNotEmpty()
    start_time: string;

    @IsArray()
    @IsEnum(TaskType, { each: true }) // Проверка, что каждый элемент массива — это валидное значение из перечисления TaskType
    types: TaskType[];
}
