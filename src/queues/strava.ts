import { mapKeys, camelCase } from 'lodash';

import knex from '../db';
import log from '../log';
import { createActivity } from '../utils/strava';

import Activity from '../models/activity';
import User from '../models/user';
import Round from '../models/round';
import SegmentEffort from '../models/segment-effort';
import League from '../models/league';
import StravaSegment from '../models/strava-segment';

import { call } from '../utils/strava';
import logger from '../log';

const strava = async (job: any) => {
  try {
    if (!job.data) {
      log.error('Strava: Failed to process job', job);
      return;
    }

    const {
      allPoints,
      roundId,
      leagueId,

      objectId,
      objectType,
      aspectType,
      ownerId,
      updates,
    } = job.data;

    logger.debug('Processing Strava queue', job.data);

    if (allPoints) {
      if (leagueId) {
        const rounds = await Round.query().where('league_id', leagueId);
        for (const round of rounds) {
          await round.calculatePoints();
        }
        return;
      }

      if (roundId) {
        const round = await Round.query().findById(roundId);
        if (!round) throw new Error(`Round not found ${roundId}`);
        return await round.calculatePoints();
      }

      const rounds = await Round.query();
      for (const round of rounds) {
        logger.debug('Waiting: round calculate points', round.id);
        await round.calculatePoints();
      }
      return;
    }

    const user = await User.query().findOne({ strava_id: ownerId });
    if (!user) {
      log.error(`No user found with ownerId: ${ownerId}`);
      // don't throw as there's no point ever retrying this
      return;
    }

    if (objectType === 'athlete') {
      if (updates && updates.authorized === 'false') {
        await user.$query().patch({ stravaAccessToken: null });
        return;
      }

      log.error('Unknown Strava webhook payload', job);
      return;
    }

    if (objectType !== 'activity') {
      throw new Error(`Unknown object type ${objectType}`);
    }

    if (!user.stravaAccessToken) {
      log.debug(
        `Skipping webhook for ${user.id} due to missing access token`,
        job,
      );
      return;
    }

    let activity: Activity | undefined;

    switch (aspectType) {
      case 'create':
        activity = await insert(objectId, user);
        break;
      case 'update':
        activity = await update(objectId, user, updates);
        break;
      case 'delete':
        activity = await deleteActivity(objectId, user);
        break;
      default:
        throw new Error('Unknown aspect type');
    }

    if (activity) {
      activityChanged(activity, user);
    }
  } catch (ex) {
    log.error('Error processing Strava activity webhook', ex);
    throw ex;
  }
};

const insert = async (objectId: any, user: User) => {
  try {
    const activity = await call(
      user.stravaAccessToken,
      `activities/${objectId}`,
    );

    return await createActivity(user.id, activity);
  } catch (ex) {
    // if we can't find the activity the strava webhook is telling us about...
    // STRAVA IS CRAZY (or it was deleted, or something sensible)
    if (ex.message === 'Call to Strava failed Not Found') {
      return;
    }

    // if it already exists ignore...
    if (ex.constraint && ex.constraint === 'activities_strava_id_unique') {
      return;
    }

    throw ex;
  }
};

const update = async (objectId: any, user: User, updates: object) => {
  let activity = await Activity.query().findOne({
    strava_id: objectId,
    user_id: user.id,
  });

  if (!activity) {
    activity = await insert(objectId, user);
  }

  if (!activity) {
    // just ignore it
    log.error(`No activity found for object ${objectId} user ${user.id}`);
    return;
  }

  return (await Activity.query()
    .patch({
      ...Object.keys(updates).reduce((acc: object, key: string) => {
        let value: any = (<any>updates)[key];

        if (key.toLowerCase() === 'private') {
          value = value ? true : false;
        }

        (<any>acc)[camelCase(key)] = value;
        return acc;
      }, {}),
      raw: {
        ...activity.raw,
        ...updates,
      },
    })
    .where({
      strava_id: objectId,
      user_id: user.id,
    })
    .returning('*'))[0];
};

const deleteActivity = async (objectId: any, user: User) => {
  const activity = await Activity.query()
    .where({
      strava_id: objectId,
      user_id: user.id,
    })
    .first();

  if (activity) {
    await activity.$query().delete();
  }

  return activity;
};

const activityChanged = async (activity: Activity, user: User) => {
  const segmentEfforts = await SegmentEffort.query().where(
    'activity_id',
    activity.id,
  );

  const updatedRoundIds: Array<number> = [];

  const updateRounds = async (rounds: Round[]) => {
    for (const round of rounds) {
      if (updatedRoundIds.includes(round.id)) continue;
      await round.calculatePoints();
      updatedRoundIds.push(round.id);
    }
  };

  for (const effort of segmentEfforts) {
    const rounds = await effort.$relatedQuery<Round>('rounds');
    await updateRounds(rounds);
  }

  const startDate = activity.startDate || (<any>activity).start_date;

  if (!startDate) {
    throw new Error(`No startDate for activity, ${JSON.stringify(activity)}`);
  }

  const rounds = await Round.query()
    .distinct('rounds.*')
    .join('leagues', 'leagues.id', 'rounds.league_id')
    .join(
      'leagues_participants',
      'leagues_participants.user_id',
      knex.raw('?', [activity.userId || user.id]),
    )
    .join('league_types', 'league_types.id', 'leagues.league_type_id')
    .where('league_types.name', 'distance')
    .where('rounds.start_date', '<', startDate)
    .where('rounds.end_date', '>', startDate)
    .whereNotIn('rounds.id', updatedRoundIds);

  await updateRounds(rounds);
};

export default strava;
