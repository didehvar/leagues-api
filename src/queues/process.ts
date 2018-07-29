import { resolve } from 'path';

import { stravaQueue, stravaActivitiesQueue } from './index';
import stravaActivities from './strava-activities';
import strava from './strava';
import logger from '../log';

logger.debug('Starting queue processer');

stravaQueue.process(strava);
stravaActivitiesQueue.process(stravaActivities);

logger.debug('Queue processer running');

process.on('exit', err => logger.debug('exit event', err));
process.on('uncaughtException', err => {
  logger.debug('uncaughtException', err);
  process.exit();
});
