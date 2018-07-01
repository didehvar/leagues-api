import { Context } from 'koa';
import { stringify } from 'querystring';
import fetch from 'node-fetch';

import log from '../log';
import Activity from '../models/activity';
import StravaSegment from '../models/strava-segment';
import SegmentEffort from '../models/segment-effort';

export async function call(
  token: string,
  endpoint: string,
  queryParams: object = {},
) {
  const query = stringify({
    access_token: token,
    ...queryParams,
  });

  const res = await fetch(`https://www.strava.com/api/v3/${endpoint}?${query}`);

  if (!res.ok) {
    log.warn('Strava call failed', {
      status: res.status,
      statusText: res.statusText,
    });
    throw new Error(`Call to Strava failed ${res.statusText}`);
  }

  return await res.json();
}

export async function callCtx(ctx: Context, endpoint: string) {
  const token = ctx.state.user.stravaToken;
  try {
    return await call(token, endpoint);
  } catch (ex) {
    return ctx.throw(500, ex.message);
  }
}

interface Parameters {
  page?: number;
  perPage?: number;
}

export async function callPage(
  ctx: Context,
  endpoint: string,
  parameters?: Parameters,
) {
  const params: Parameters = { ...parameters };
  if (!params.page) params.page = 1;
  if (!params.perPage) params.perPage = 30;

  const query = stringify({
    access_token: ctx.state.user.stravaToken,
    page: params.page || 1,
    per_page: params.perPage,
  });

  const res = await fetch(`https://www.strava.com/api/v3/${endpoint}?${query}`);

  if (!res.ok) {
    log.error('Strava starred segments call failed', {
      status: res.status,
      error: await res.json(),
    });
    return ctx.throw(500, 'Call to Strava failed');
  }

  const data = await res.json();
  return {
    data,
    ...params,
    nextPage: params && params.perPage >= data.length,
  };
}

export async function callAllPages(ctx: Context, endpoint: string) {
  const perPage = 30;
  let data: any[] = [];
  let segments: any[] = [];
  let page = 1;

  do {
    const query = stringify({
      access_token: ctx.state.user.stravaToken,
      page: page++,
      per_page: perPage,
    });

    const res = await fetch(
      `https://www.strava.com/api/v3/${endpoint}?${query}`,
    );

    if (!res.ok) {
      log.error('Strava starred segments call failed', {
        status: res.status,
        error: await res.json(),
      });
      return ctx.throw(500, 'Call to Strava failed');
    }

    segments = await res.json();
    data = data.concat(
      segments.map(({ id, name, activity_type }) => ({
        id,
        name,
        activityType: activity_type,
      })),
    );
  } while (segments.length === perPage);

  return {
    data,
  };
}

export async function createActivity(userId: number, activity: any) {
  const dbActivity = await Activity.query()
    .insert({
      userId,
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

  if (!activity.segment_efforts) return activity;

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
      userId,
      stravaSegmentId: stravaSegment.id,
      distance: effort.distance,
      elapsedTime: effort.elapsed_time,
      startDate: effort.start_date,
      stravaRaw: effort,
    });
  }

  await SegmentEffort.query().insert(efforts);

  return activity;
}
