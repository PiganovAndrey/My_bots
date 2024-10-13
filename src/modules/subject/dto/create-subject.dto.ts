import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDto {
    @ApiProperty({
        description: 'Линк зум конфренции для подключения к занятию по данному предмету',
        example: 'link Zoom конференции'
    })
    @IsString()
    @IsNotEmpty()
    link: string;

    @ApiProperty({
        description: 'Название предмета',
        example: 'Тестирование'
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}
