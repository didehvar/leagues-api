import { resolve } from 'path';

import { stravaQueue, stravaActivitiesQueue } from './index';
import stravaActivities from './strava-activities';
import strava from './strava';
import logger from '../log';

logger.debug('Starting queue processer');

const errorHandler = (name: string, worker: any) => async (job: any) => {
  try {
    await worker(job);
  } catch (ex) {
    logger.error(`Failed processing worker, ${name} :`, ex);
    throw ex;
  }
};

stravaQueue.process(errorHandler('strava', strava));
stravaActivitiesQueue.process(
  errorHandler('stravaActivities', stravaActivities),
);

logger.debug('Queue processer running');

process.on('exit', err => logger.debug('exit event', err));
process.on('uncaughtException', err => {
  logger.debug('uncaughtException', err);
  process.exit();
});
