import { resolve } from 'path';

import { stravaQueue, stravaActivitiesQueue } from './index';
import logger from '../log';

logger.debug('Starting queue processer');

stravaQueue.process(resolve(__dirname, `strava.ts`));
stravaActivitiesQueue.process(resolve(__dirname, `strava-activities.ts`));

logger.debug('Queue processer running');

process.on('exit', err => logger.debug('exit event', err));
process.on('SIGINT', () => logger.debug('SIGINT event'));
process.on('SIGUSR1', () => logger.debug('SIGUSR1 event'));
process.on('SIGUSR2', () => logger.debug('SIGUSR2 event'));
process.on('uncaughtException', err => logger.debug('uncaughtException', err));

process.stdin.resume();
