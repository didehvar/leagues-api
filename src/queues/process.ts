import { resolve } from 'path';

import { stravaQueue } from './index';

stravaQueue.process(resolve(__dirname, `strava.ts`));
