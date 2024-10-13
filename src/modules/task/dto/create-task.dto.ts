import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Id предмета для которой будет выполняться задача',
        example: '2'
    })
    @IsInt()
    @IsNotEmpty()
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
