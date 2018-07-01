import { format } from 'date-fns';

import '../db';
import log from '../log';
import { call, createActivity } from '../utils/strava';
import User from '../models/user';
import { stravaQueue } from '.';

const PER_PAGE = 100;

const activities = async (job: any) => {
  try {
    const user: User = job.data;
    let page = 1;

    while (page && page > 0) {
      const activities = await call(
        user.stravaAccessToken,
        'athlete/activities',
        {
          page,
          after: format(new Date('2018-01-01'), 'X'),
          per_page: PER_PAGE,
        },
      );

      page = (activities || []).length === PER_PAGE ? page + 1 : 0;

      for (const activity of activities) {
        await createActivity(user.id, activity);
      }
    }
  } catch (ex) {
    log.error('Error processing Strava activity webhook', ex);
    return Promise.reject(ex);
  }

  return Promise.resolve();
};

export default activities;
