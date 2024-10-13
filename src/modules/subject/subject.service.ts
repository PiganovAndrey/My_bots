import { Inject, Injectable, LoggerService, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { subjects } from '@prisma/client';
import { SuccessResponse } from 'src/common/response/success.response';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
    constructor(
        private readonly prisma: DatabaseService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
    ) {}

    async createSubject(dto: CreateSubjectDto): Promise<subjects> {
        try {
            this.logger.log('Начинается создание предмета');

            const subject = await this.prisma.subjects.findFirst({
                where: { name: dto.name }
            });

            if (subject) {
                this.logger.warn(
                    `Subject alredy exists for link and name: ${dto.link} and ${dto.name}`,
                    SubjectService.name
                );
            }
            const newSubject = await this.prisma.subjects.create({
                data: {
                    ...dto
                }
            });

            this.logger.log(`New subject created with id: ${newSubject.id}`, SubjectService.name);
            return newSubject;
        } catch (error) {
            this.logger.error('Error in createSubject method', error);
            throw error;
        }
    }

    async getAllSubjects(): Promise<subjects[]> {
        try {
            this.logger.log('Fetching all subjects', SubjectService.name);
            return await this.prisma.subjects.findMany({ take: 100 });
        } catch (error) {
            this.logger.error('Error fetching all subjects', error);
            throw error;
        }
    }

    async getSubjectById(id: number): Promise<subjects> {
        try {
            this.logger.log('Fetching subject by id', SubjectService.name);
            return await this.prisma.subjects.findFirst({ where: { id } });
        } catch (error) {
            this.logger.error('Error fetching subject by id', error);
            throw error;
        }
    }

    async deleteSubjectById(id: number): Promise<SuccessResponse> {
        try {
            this.logger.log(`Deleting subject by id: ${id}`, SubjectService.name);
            const subject = await this.prisma.subjects.findFirst({ where: { id } });

            if (!subject) {
                this.logger.warn(`Subject not found for id: ${id}`, SubjectService.name);
                throw new NotFoundException('Предмет с данным id не найден');
            }
            await this.prisma.subjects.delete({ where: { id } });
            this.logger.log(`Subject deleted successfully for id: ${id}`, SubjectService.name);
            return { success: true };
        } catch (error) {
            this.logger.error('Error deleteSubject by id', error);
            throw error;
        }
    }

    async updateSubjectById(dto: UpdateSubjectDto): Promise<subjects> {
        try {
            this.logger.log(`Updating subject by id: ${dto.id}`, SubjectService.name);
            const subjet = await this.prisma.subjects.findFirst({ where: { id: dto.id } });

            if (!subjet) {
                this.logger.warn(`Subject not found for id: ${dto.id}`, SubjectService.name);
                throw new NotFoundException('Предмет с данным id не найден');
            }
            const newSubject = await this.prisma.subjects.update({
                where: { id: dto.id },
                data: { link: dto.link, name: dto.name }
            });
            return newSubject;
        } catch (error) {
            this.logger.error('Error updateSubject method', error);
            throw error;
        }
    }
}
