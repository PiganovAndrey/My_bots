import puppeteer from 'puppeteer';
import formatTime from '../src/utils/formatTime';
import { getCurrentDay } from '../src/utils/getCurrentDay';
import logger from '../src/utils/logger';
import exclusiveScript from './exclusiveScript';
import delay from 'src/utils/delay';

export default async function startZoomClass(link: string, className: string): Promise<void> {
    try {
        const now = new Date();
        const dayOfWeek = getCurrentDay();
        const time = formatTime(now);

        logger.info(`Выполняется задача в ${dayOfWeek} ${time} - ${className}`);

        const browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/google-chrome-stable',
            args: [
                '--use-fake-ui-for-media-stream', // Автоматически принимает запросы на доступ к микрофону/камере
                '--use-fake-device-for-media-stream', // Использует фейковые устройства для тестирования
                // '--use-file-for-fake-audio-capture=./assets/micro.wav',
                '--allow-file-access',
                '--no-sandbox',
                '--disable-setuid-sandbox'
                // '--accept-cookies', // Пробуем автоматически принимать cookies
                // '--disable-features=SameSiteByDefaultCookies' // Отключение обработки SameSite
            ],
            ignoreDefaultArgs: ['--mute-audio'],
            protocolTimeout: 0,
            timeout: 0
        });

        const context = browser.defaultBrowserContext();

        await context.overridePermissions(link, ['microphone', 'camera']);
        await context.overridePermissions('https://zoom.us', ['microphone', 'camera']);
        await context.overridePermissions('https://app.zoom.us', ['microphone', 'camera']);

        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36'
        );

        // Добавим необходимые заголовки (например, для Zoom)
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9'
        });

        const page2 = await browser.newPage(); // Для скипа окна браузера зума.

        await page.setViewport({
            width: 1280,
            height: 720,
            deviceScaleFactor: 1 // Масштабирование. 1 = 100%, 2 = 200%, и т.д.
        });

        await page2.setViewport({
            width: 1280,
            height: 720,
            deviceScaleFactor: 1
        });

        await page.goto(link, { waitUntil: 'networkidle2' });
        await page2.goto(link);

        await page2.close();

        await page.screenshot({ path: 'page.png' });

        // const testIFrame = await page.$('iframe'); // Для стран ЕС

        // const testFrame = await testIFrame.contentFrame(); // для стран ЕС

        // await testFrame.waitForSelector('button[id="onetrust-accept-btn-handler"]'); // Для стран ЕС

        // await testFrame.click('button[id="onetrust-accept-btn-handler"]'); // Для стран ЕС

        await page.waitForSelector('a[download]', { timeout: 60000 });

        await page.click('a[download]');

        await page.screenshot({ path: 'screens/download.png' });

        await page.waitForSelector('a[web_client]');

        await delay(15000);

        await page.screenshot({ path: 'screens/webClient.png' });

        const response = await Promise.all([
            page.click('a[web_client]'), // Клик по элементу
            page.waitForNavigation() // Ожидание редиректа
        ]);

        await page.goto(response[1].url());

        const iframeElement = await page.$('iframe');

        const frame = await iframeElement.contentFrame();

        // await frame.waitForSelector('button[id="wc_agree1"]', { visible: true }); // Для стран ЕС

        // await frame.click('button[id="wc_agree1"]'); // Для стран ЕС

        await frame.waitForSelector('input[type="text"]', { visible: true });

        await frame.type('input[type="text"]', 'Пиганов Андрей 3102д');

        await frame.click('button[type=button]');
        try {
            await frame.waitForSelector('div[class="preview-video__control-button-container simple"]', {
                timeout: 5000
            });

            await frame.click('div[class="preview-video__control-button-container simple"]');

            await frame.click('div[class="preview-video__control-button-container simple"]');

            logger.warn('Отлично подключили звук для конференции, она еще не началась');
        } catch {
            await frame.waitForSelector(
                'button[class="zm-btn join-audio-by-voip__join-btn zm-btn--primary zm-btn__outline--white zm-btn--lg"]',
                { visible: true, timeout: 0 }
            );

            await delay(10000);

            await frame.click(
                'button[class="zm-btn join-audio-by-voip__join-btn zm-btn--primary zm-btn__outline--white zm-btn--lg"]'
            );

            logger.warn('Конференция уже работает и подключили звук');
        }

        await page.screenshot({ path: 'screens/btn.png' });

        await delay(15000);

        logger.info('Бот вошел в конференцию');

        await page.screenshot({ path: 'screens/conference.png' });

        if (className === 'Тестовый блок' || className === 'Технология разработки и защиты баз данных') {
            logger.info('Обработка ответов эксклюзив для Базы данных');

            await exclusiveScript(frame, page);
        }

        await page.screenshot({ path: 'screens/screenshot4.png' });

        const closeTime = 90 * 60 * 1000;

        await new Promise<void>((resolve) => {
            setTimeout(async () => {
                await page.screenshot({ path: 'screens/screenshot5.png' });
                await page.close();
                await browser.close();
                const endDateWork = new Date();
                const endTime = formatTime(endDateWork);
                logger.info('Браузер закрыт через полтора часа');
                logger.info(`Задача закончилась в ${dayOfWeek} ${endTime}`);
                resolve();
            }, closeTime);
        });

        return;
    } catch (error) {
        logger.error('Произошла ошибка', error);
        throw error;
    }
}
