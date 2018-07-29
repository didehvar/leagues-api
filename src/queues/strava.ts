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
      objectId,
      objectType,
      aspectType,
      ownerId,
      updates,
    } = job.data;

    logger.debug('Processing Strava queue', job.data);

    if (allPoints) {
      const rounds = await Round.query();
      for (const round of rounds) {
        await round.calculatePoints();
      }
      return;
    }

    if (objectType !== 'activity')
      throw new Error(`Unknown object type ${objectType}`);

    const user = await User.query().findOne({ strava_id: ownerId });
    if (!user) throw new Error(`No user found with ownerId: ${ownerId}`);

    let activity: Activity;

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

    if (!activity) {
      log.error('Activity not set', job.data);
      return;
    }

    activityChanged(activity, aspectType);
  } catch (ex) {
    log.error('Error processing Strava activity webhook', ex);
    throw ex;
  }
};

const insert = async (objectId: any, user: User) => {
  const activity = await call(user.stravaAccessToken, `activities/${objectId}`);
  return await createActivity(user.id, activity);
};

const update = async (
  objectId: any,
  user: User,
  updates: ArrayLike<object>,
) => {
  let activity = await Activity.query().findOne({
    strava_id: objectId,
    user_id: user.id,
  });

  if (!activity) {
    activity = await insert(objectId, user);
  }

  if (!activity) {
    throw new Error(`No activity found for object ${objectId} user ${user.id}`);
  }

  return (await Activity.query()
    .patch({
      ...mapKeys(updates, (v, k: string) => camelCase(k)),
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
    .first()
    .returning('*');

  await activity.$query().delete();

  return activity;
};

const activityChanged = async (activity: Activity, aspectType: string) => {
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

  const rounds = await Round.query()
    .distinct('rounds.*')
    .join('leagues', 'leagues.id', 'rounds.league_id')
    .join(
      'leagues_participants',
      'leagues_participants.user_id',
      knex.raw('?', [activity.userId]),
    )
    .join('league_types', 'league_types.id', 'leagues.league_type_id')
    .where('league_types.name', 'distance')
    .where('rounds.start_date', '<', activity.startDate)
    .where('rounds.end_date', '>', activity.startDate)
    .whereNotIn('rounds.id', updatedRoundIds);

  console.log('👌🏻🏻🏻🏻🏻🏻🏻🏻🏻🏻🏻🏻🏻', updatedRoundIds);
  console.log('😭😭😭😭😭😭😭😭😭😭😭😭', rounds);

  await updateRounds(rounds);
};

export default strava;
