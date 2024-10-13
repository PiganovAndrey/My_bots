import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSubjectDto {
    @IsInt()
    @IsNotEmpty()
    readonly id: number;
    @IsString()
    @IsOptional()
    readonly name: string;
    @IsString()
    @IsOptional()
    readonly link: string;
}
