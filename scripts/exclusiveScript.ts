import { ElementHandle, Frame, Page } from 'puppeteer';
import gptSendMessage from '../src/utils/gptReq';
import logger from '../src/utils/logger';
import delay from 'src/utils/delay';

export default async function exclusiveScript(frame: Frame, page: Page) {
    try {
        await delay(10000);

        await page.screenshot({ path: 'screens/exclusive.png' });

        await frame.waitForSelector('div[class="footer-chat-button"]', { timeout: 0 });

        await frame.waitForSelector('div[id="chat"]', { timeout: 0 });

        await frame.click('div[class="footer-chat-button"]');

        await frame.click('div[id="chat"]');

        await delay(10000);

        await page.screenshot({ path: 'screens/chat.png' });

        let foundEl: ElementHandle | null;
        let viewLast: ElementHandle | null;
        let found = false;

        while (!found) {
            viewLast = await frame.$('span[class="chat-content__unread-msg"]');
            foundEl = await frame.$('div span[title="Астанин Павел Андреевич"]');
            if (!viewLast && foundEl) {
                found = true;
                logger.info('Элемент найден!');
                await page.screenshot({ path: 'screens/result.png' });
                break;
            } else {
                if (viewLast) {
                    await viewLast.click();
                    await page.screenshot({ path: 'screens/while.png' });
                    await new Promise<void>((resolve) => {
                        setTimeout(() => {
                            logger.info('Ожидаем');
                            resolve();
                        }, 1000);
                    });
                }
            }
        }

        await frame.waitForSelector('div span[title="Астанин Павел Андреевич"]', { timeout: 0 });

        await delay(10000);

        await page.screenshot({ path: 'screens/gotIt.png' });

        const gotIt = await frame.$('button[class="zmu-btn ax-outline zmu-btn--primary zmu-btn__outline--blue"]');

        if (gotIt) {
            await gotIt.click();
        }

        const viewLastMessage = await frame.$('span[class="chat-content__unread-msg"]');

        if (viewLastMessage) {
            await page.screenshot({ path: 'screens/lastMessage.png' });
            await viewLastMessage.click();
            await delay(10000);
            await page.screenshot({ path: 'screens/lastMessageClear.png' });
        }

        const divchatItem = await frame.$('div span[title="Астанин Павел Андреевич"]'); // Имя преподователя в Zoom
        const chatItem = await frame.$('div.chat-item-position:has(span[title="Астанин Павел Андреевич"])');

        if (divchatItem) {
            const divP = await chatItem.$('div[class="_rtfEditor_1n3rs_1"] > p');

            if (divP) {
                const pContent = await divP.evaluate((p) => p.textContent);

                logger.info(`Текст элемента p:${pContent}`);

                const response = await gptSendMessage({
                    role: 'user',
                    content: `${pContent}(Ответь коротко на этот, вопрос просто без обьяснения)`
                });

                logger.info(`Получен ответ на вопрос${response}`);

                const replyBtn = await chatItem.$('button[aria-label="Reply"]');

                await replyBtn.scrollIntoView();

                await divP.hover();

                await page.screenshot({ path: 'screens/screenshot.png' });

                await replyBtn.click();

                await page.screenshot({ path: 'screens/screenshot2.png' });

                logger.info('Открыли сообщения');

                const editableDiv = await frame.$('div[contenteditable="true"]');

                logger.info('Кликаем и начинаем вписывать сообщение');

                await editableDiv.click();

                await page.keyboard.type(response);

                await page.keyboard.press('Enter');

                await page.screenshot({ path: 'screens/screenshot3.png' });

                logger.info('Отправили сообщение');
            } else {
                logger.warn('Элемент p не найден.');
            }
        } else {
            logger.error('div с span[title="Имя преподавателя в Zoom"] не найден.');
        }
    } catch (error) {
        logger.error(error);
        throw error;
    }
}
