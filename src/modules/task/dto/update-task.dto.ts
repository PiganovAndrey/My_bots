import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTaskDto {
    @ApiProperty({
        description: 'id задачи',
        example: '3'
    })
    @IsInt()
    @IsNotEmpty()
    id: number;
    @ApiProperty({
        description: 'Id предмета для которой будет выполняться задача',
        example: '2'
    })
    @IsInt()
    @Optional()
    subjectId: number;

    @ApiProperty({
        description: 'Время начала задачи',
        example: 'Время в String'
    })
    @IsDateString()
    @IsOptional()
    start_time: string;

    @IsOptional()
    @IsArray()
    @IsEnum(TaskType, { each: true }) // Проверка, что каждый элемент массива — это валидное значение из перечисления TaskType
    types: TaskType[];
}
