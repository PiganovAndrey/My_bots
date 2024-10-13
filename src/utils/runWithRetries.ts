import logger from './logger';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function runWithRetries(script: Function, maxRetries: number = 5, delayMs: number = 2000) {
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
        try {
            attempt++;
            logger.info(`Попытка #${attempt} запустить скрипт...`);

            // Запускаем основной скрипт
            await script();

            success = true; // Если успешно, выходим из цикла
            logger.info('Скрипт успешно завершён.');
        } catch (error) {
            logger.error(`Ошибка на попытке #${attempt}: ${error}`);

            if (attempt >= maxRetries) {
                logger.error('Превышено количество попыток. Скрипт завершён.');
                throw error; // Завершаем, если количество попыток исчерпано
            }

            logger.info(`Ждём ${delayMs / 1000} секунд перед повторной попыткой...`);
            await delay(delayMs); // Ждём перед новой попыткой
        }
    }
}
