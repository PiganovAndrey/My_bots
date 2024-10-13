import puppeteer from 'puppeteer';
import formatTime from '../src/utils/formatTime';
import { getCurrentDay } from '../src/utils/getCurrentDay';
import logger from '../src/utils/logger';

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
        // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
        // page.on('response', (response) => console.log('Received response:', response.url()));
        // page.on('requestfailed', (request) =>
        //     console.log('Request failed:', request.url(), request.failure().errorText)
        // ); // Для отладки, увидеть логи браузере и тд...

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

        await page.waitForSelector('a[download]', { timeout: 60000 });

        await page.click('a[download]');

        await page.waitForSelector('a[web_client]');

        const response = await Promise.all([
            page.click('a[web_client]'), // Клик по элементу
            page.waitForNavigation() // Ожидание редиректа
        ]);

        await page.goto(response[1].url());

        const iframeElement = await page.$('iframe');

        const frame = await iframeElement.contentFrame();

        await frame.waitForSelector('input[type="text"]', { visible: true });

        await frame.type('input[type="text"]', 'Пиганов Андрей 3102д');

        await frame.click('button[type=button]');
        try {
            await frame.waitForSelector('div[class="preview-video__control-button-container simple"]', {
                timeout: 5000
            });

            await frame.click('div[class="preview-video__control-button-container simple"]');

            await frame.click('div[class="preview-video__control-button-container simple"]');

            logger.info('Отлично подключили звук для конференции');
        } catch {
            await frame.waitForSelector(
                'button[class="zm-btn join-audio-by-voip__join-btn zm-btn--primary zm-btn__outline--white zm-btn--lg"]'
            );

            await frame.click(
                'button[class="zm-btn join-audio-by-voip__join-btn zm-btn--primary zm-btn__outline--white zm-btn--lg"]'
            );

            logger.warn('Конференция уже работает и подключили звук');
        }

        logger.info('Бот вошел в конференцию');

        const closeTime = 90 * 60 * 1000; // 90 минут в миллисекундах

        await new Promise(() => {
            setTimeout(async () => {
                await page.close();
                await browser.close();
                const endDateWork = new Date();
                const endTime = formatTime(endDateWork);
                logger.info('Браузер закрыт через полтора часа');
                logger.info(`Задача закончилась в ${dayOfWeek} ${endTime}`);
            }, closeTime);
        });

        return;
    } catch (error) {
        logger.error('Произошла ошибка', error);
        throw error;
    }
}
