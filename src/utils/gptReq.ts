import axios from 'axios';
import Message from '../common/interfaces/Message';
import logger from './logger';
import { ConfigService } from '@nestjs/config';

export default async function gptSendMessage(message: Message) {
    const confiService = new ConfigService();
    const API_PROXY_KEY = confiService.get<string>('API_PROXY_KEY');

    const data = {
        model: 'gpt-3.5-turbo',
        messages: [message]
    };

    const config = {
        headers: {
            Authorization: `Bearer ${API_PROXY_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios.post('https://api.proxyapi.ru/openai/v1/chat/completions', data, config);
        const responseData = response.data.choices[0];
        return responseData.message.content;
    } catch (error) {
        logger.error(error);
        throw error;
    }
}
