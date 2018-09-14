import 'dotenv/config';
import { stravaQueue, stravaActivitiesQueue } from '../queues/index';

async function start() {
  await stravaQueue.clean(3600 * 1000, 'completed');
  await stravaActivitiesQueue.clean(3600 * 1000, 'completed');
  process.exit();
}

start();
