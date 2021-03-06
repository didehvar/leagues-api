import { Pool } from 'pg';
import { chunk, last } from 'lodash';
import config from './config';
import {
  slugify,
  impenduloDiscipline,
  stravaActivities,
  stravaActivity,
} from './helpers';
import { isAfter, format, differenceInMilliseconds, subMonths } from 'date-fns';

import { createActivity } from '../src/utils/strava';

const MS_BETWEEN_REQUESTS = 3000;

// const dateBefore = '2018-04-01';
const dateAfter = '2018-01-01';
const dateBefore = '2018-02-01';

const activities = async (impenduloPool: Pool, slPool: Pool) => {
  const client = await impenduloPool.connect();

  const { rows: activityRows } = await impenduloPool.query(
    `
      select id, user_id from activities
      where
        start_date >= $1 and
        start_date < $2
    `,
    [dateAfter, dateBefore],
  );
  const activityIds = activityRows.map(a => a.id.toString());
  const userIds = activityRows.map(a => a.user_id.toString());

  const { rows } = await impenduloPool.query(`
    select
      u.id, u.strava_access_token
    from users u
    order by id asc
    `);

  // where id in ( select user_id from leagues_participants where league_id = 15703  ) and id > 99577
  // where not exists ( select a.id from activities a where u.id = a.user_id )
  // check activity dates

  try {
    await client.query('BEGIN');

    const userGroup = chunk(rows, rows.length);

    await Promise.all(
      userGroup.map(async users => {
        let lastCall = new Date();

        for (const { id, strava_access_token } of users) {
          if (userIds.includes(id.toString())) {
            continue;
          }

          console.log('Starting for ', id);
          let page: number = 1;

          while (page > 0) {
            let activities;

            while (!activities) {
              try {
                let dateDiffMs = differenceInMilliseconds(new Date(), lastCall);
                do {
                  await new Promise(resolve =>
                    setTimeout(resolve, MS_BETWEEN_REQUESTS - dateDiffMs),
                  );
                  dateDiffMs = differenceInMilliseconds(new Date(), lastCall);
                } while (dateDiffMs < MS_BETWEEN_REQUESTS);

                activities = await stravaActivities(strava_access_token, {
                  page,
                  per_page: 100,
                  before: format(dateBefore, 'X'),
                  after: format(dateAfter, 'X'),
                });

                lastCall = new Date();
              } catch (e) {
                if (e.status === 401 || e.status === 404) break;
                await new Promise(resolve =>
                  setTimeout(resolve, 1000 * 60 * 1),
                );

                console.error(
                  '⏰ ',
                  format(new Date(), 'HH:mm:ss'),
                  e.status,
                  'Activities call failed',
                  e.message,
                );
              }
            }

            page++;
            if (!activities) break;
            if (activities.length !== 100) page = 0;

            for (const rawActivity of activities) {
              if (activityIds.includes(rawActivity.id.toString())) {
                continue;
              }

              let activity;
              while (!activity) {
                try {
                  activity = await stravaActivity(
                    strava_access_token,
                    rawActivity.id,
                  );
                } catch (e) {
                  if (e.status === 401 || e.status === 404) break;
                  await new Promise(resolve =>
                    setTimeout(resolve, 1000 * 60 * 1),
                  );

                  console.error(
                    '⏰ ',
                    format(new Date(), 'HH:mm:ss'),
                    e.status,
                    'Activity call failed',
                    e.message,
                  );
                }
              }
              if (!activity) break;
              try {
                await createActivity(id, activity);
              } catch (ex) {
                if (
                  !ex.constraint ||
                  ex.constraint !== 'activities_strava_id_unique'
                ) {
                  throw ex;
                }
              }
            }
          }
        }
      }),
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    console.log('✌🏻 ', 'Activities migrated');
    client.release();
  }
};

export default activities;
