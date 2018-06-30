import { mapKeys, camelCase } from 'lodash';

import knex from '../db';
import log from '../log';

import Activity from '../models/activity';
import User from '../models/user';
import Round from '../models/round';
import SegmentEffort from '../models/segment-effort';
import League from '../models/league';
import StravaSegment from '../models/strava-segment';

import { call } from '../utils/strava';

const strava = async (job: any) => {
  try {
    const {
      allPoints,
      objectId,
      objectType,
      aspectType,
      ownerId,
      updates,
    } = job.data;

    if (allPoints) {
      const rounds = await Round.query();
      for (const round of rounds) {
        await round.calculatePoints();
      }
      return;
    }

    if (objectType !== 'activity') throw new Error('Unknown object type');

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

    activityChanged(activity, aspectType);

    return Promise.resolve();
  } catch (ex) {
    log.error('Error processing Strava activity webhook', ex);
    return Promise.reject(ex);
  }
};

const insert = async (objectId: any, user: User) => {
  const activity = await call(user.stravaAccessToken, `activities/${objectId}`);

  const dbActivity = await Activity.query()
    .insert({
      userId: user.id,
      stravaId: activity.id,
      resourceState: activity.resource_state,
      externalId: activity.external_id,
      uploadId: activity.upload_id,
      athleteId: activity.athlete.id,
      athleteResourceState: activity.athlete.resource_state,
      name: activity.name,
      distance: activity.distance,
      movingTime: activity.moving_time,
      elapsedTime: activity.elapsed_time,
      totalElevationGain: activity.total_elevation_gain,
      type: activity.type,
      startDate: activity.start_date,
      startDateLocal: activity.start_date_local,
      timezone: activity.timezone,
      utcOffset: activity.utc_offset,
      startLatlng: activity.start_latlng,
      endLatlng: activity.end_latlng,
      locationCity: activity.location_city,
      locationState: activity.location_state,
      locationCountry: activity.location_country,
      startLatitude: activity.start_latitude,
      startLongitude: activity.start_longitude,
      achievementCount: activity.achievement_count,
      kudosCount: activity.kudos_count,
      commentCount: activity.comment_count,
      athleteCount: activity.athlete_count,
      photoCount: activity.photo_count,
      mapId: activity.map_id,
      mapPolyline: activity.map_polyline,
      mapResourceStat: activity.map_resource_stat,
      trainer: activity.trainer,
      commute: activity.commute,
      manual: activity.manual,
      private: activity.private,
      flagged: activity.flagged,
      gearId: activity.gear_id,
      fromAcceptedTag: activity.from_accepted_tag,
      averageSpeed: activity.average_speed,
      maxSpeed: activity.max_speed,
      deviceWatts: activity.device_watts,
      hasHeartrate: activity.has_heart_rate,
      prCount: activity.pr_count,
      totalPhotoCount: activity.total_photo_count,
      hasKudoed: activity.kas_kudoed,
      workoutType: activity.workout_type,
      description: activity.description,
      calories: activity.calories,
      partnerBrandTag: activity.partner_brand_tag,
      highlightedKudosers: activity.highlighted_kudosers,
      embedToken: activity.embed_token,
      segmentLeaderboardOptOut: activity.segment_leaderboard_opt_out,
      leaderboardOptOut: activity.leaderboard_opt_out,
      raw: activity,
    })
    .returning('*');

  let efforts: object[] = [];

  for (const effort of activity.segment_efforts) {
    let stravaSegment = await StravaSegment.query().findOne(
      'strava_id',
      effort.segment.id,
    );

    if (!stravaSegment) {
      stravaSegment = await StravaSegment.query().insert({
        name: effort.segment.name,
        stravaId: effort.segment.id,
        stravaRaw: effort.segment,
      });
    }

    if (!stravaSegment)
      throw new Error(`Failed to find/create stravaSegment ${effort.id}`);

    efforts.push({
      activityId: dbActivity.id,
      userId: user.id,
      stravaSegmentId: stravaSegment.id,
      distance: effort.distance,
      elapsedTime: effort.elapsed_time,
      startDate: effort.start_date,
      stravaRaw: effort,
    });
  }

  await SegmentEffort.query().insert(efforts);

  return dbActivity;
};

const update = async (
  objectId: any,
  user: User,
  updates: ArrayLike<object>,
) => {
  const activity = await Activity.query().findOne({
    strava_id: objectId,
    user_id: user.id,
  });

  if (!activity)
    throw new Error(`No activity found for object ${objectId} user ${user.id}`);

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

const deleteActivity = async (objectId: any, user: User) =>
  Activity.query()
    .delete()
    .where({
      strava_id: objectId,
      user_id: user.id,
    })
    .first()
    .returning('*');

const activityChanged = async (activity: Activity, aspectType: string) => {
  const segmentEfforts = await activity.$relatedQuery<SegmentEffort>(
    'segmentEfforts',
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
