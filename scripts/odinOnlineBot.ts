import puppeteer from 'puppeteer';
import formatTime from '../src/utils/formatTime';
import { getCurrentDay } from '../src/utils/getCurrentDay';
import logger from '../src/utils/logger';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import path from 'path';

export default async function startOdinOnline(): Promise<void> {
    const configService = new ConfigService();
    const userDataDir = './session/odin';

    try {
        const now = new Date();
        const dayOfWeek = getCurrentDay();
        const time = formatTime(now);
        logger.info(`Бот заходит для показательного онлайна в ${dayOfWeek} ${time}`);

        const browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/google-chrome-stable',
            args: [
                '--allow-file-access',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ],
            userDataDir
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36'
        );

        // Добавим необходимые заголовки (например, для Zoom)
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9'
        });

        await page.setViewport({
            width: 1280,
            height: 720,
            deviceScaleFactor: 1
        });

        await page.goto('https://www.odin.study/ru/Account/Login', { waitUntil: 'networkidle2' });

        const isLoggin = await page.$('button[data-v-9915af7a]');

        if (isLoggin) {
            await page.type('input[type="email"]', configService.get('ODIN_EMAIL'));

            await page.type('input[type="password"]', configService.get('ODIN_PASSWORD'));

            await isLoggin.click();
        }

        const endDateWork = new Date();

        logger.info(`Бот закончил работу в ${dayOfWeek} - ${formatTime(endDateWork)}`);

        await browser.close();
    } catch (error) {
        logger.error('Произошла ошибка', error);
        const sessionDirRm = path.resolve('session/odin');
        if (fs.existsSync(sessionDirRm)) {
            logger.info(`Удаление папки: ${sessionDirRm}`);
            fs.rm(sessionDirRm, { recursive: true, force: true }, (err) => {
                if (err) {
                    logger.error(`Ошибка при удалении папки: ${err.message}`);
                } else {
                    logger.info(`Папка ${sessionDirRm} успешно удалена.`);
                }
            });
        } else {
            logger.info(`Папка ${sessionDirRm} не существует.`);
        }
        logger.error('Произошла ошибка', error);
        throw error;
    }
}
