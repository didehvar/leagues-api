import { mapKeys, camelCase } from 'lodash';
import * as fs from 'fs';
import * as util from 'util';

import '../db';
import log from '../log';

import Activity from '../models/activity';
import User from '../models/user';

import { call } from '../utils/strava';

const strava = async (job: any) => {
  try {
    const { objectId, objectType, aspectType, ownerId, updates } = job.data;

    if (objectType !== 'activity') throw new Error('Unknown object type');

    switch (aspectType) {
      case 'create':
        await insert(objectId, ownerId);
        break;
      case 'update':
        await Activity.query()
          .patch(mapKeys(updates, (v, k: string) => camelCase(k)))
          .where({
            strava_id: objectId,
            athlete_id: ownerId,
          });
        break;
      case 'delete':
        await Activity.query()
          .delete()
          .where('stravaId', objectId);
        break;
      default:
        throw new Error('Unknown aspect type');
    }

    return Promise.resolve();
  } catch (ex) {
    log.error('Error processing Strava activity webhook', ex);
    return Promise.reject(ex);
  }
};

const insert = async (objectId: any, ownerId: any) => {
  const user = await User.query().findOne({ strava_id: ownerId });

  if (!user) throw new Error(`No user found with ownerId: ${ownerId}`);

  const activity = await call(user.stravaAccessToken, `activities/${objectId}`);

  await Activity.query().insert({
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
  });
};

export default strava;
