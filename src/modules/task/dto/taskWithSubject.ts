import { Prisma } from '@prisma/client';

export type TaskWithSubject = Prisma.tasksGetPayload<{
    include: { subject: true };
}>;
