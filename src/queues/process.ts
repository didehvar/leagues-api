import { resolve } from 'path';

import { stravaQueue, stravaActivitiesQueue } from './index';
import logger from '../log';

logger.debug('Starting queue processer');

stravaQueue.process(resolve(__dirname, `strava.ts`));
stravaActivitiesQueue.process(resolve(__dirname, `strava-activities.ts`));

logger.debug('Queue processer running');

process.once('SIGTERM', () => {
  logger.debug('Closing all queues before killing worker ...');

  const closePromises: any = [];
  closePromises.forEach((queue: any) => {
    closePromises.push(queue.close());
  });

  Promise.all(closePromises)
    .then(function() {
      logger.debug('All queues closed, killing worker');
      process.exit(0);
    })
    .catch(function(err) {
      logger.debug('Error closing queues, killing worker');
      logger.error(err);
      process.exit(0);
    });
});
