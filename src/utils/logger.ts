import { winstonConfig } from '../config/winston.config';
import winston from 'winston';

export default winston.createLogger(winstonConfig);
