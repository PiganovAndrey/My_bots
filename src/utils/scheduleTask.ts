import cron from 'node-cron';
import runWithRetries from './runWithRetries';

export const scheduleTask = (time: string, tasks: Function[]) => {
    cron.schedule(time, async () => {
        for (const task of tasks) {
            await runWithRetries(task);
        }
    });
};
