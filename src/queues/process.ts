import { resolve } from 'path';

import { stravaQueue, stravaActivitiesQueue } from './index';

stravaQueue.process(resolve(__dirname, `strava.ts`));
stravaActivitiesQueue.process(resolve(__dirname, `strava-activities.ts`));
