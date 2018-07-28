import { Middleware } from 'koa';
import { isEmpty } from 'lodash';

import League from '../../models/league';
import Point from '../../models/point';
import Discipline from '../../models/discipline';
import LeagueType from '../../models/league-type';
import StravaSegment from '../../models/strava-segment';
import { callCtx } from '../../utils/strava';
import Round from '../../models/round';

export const create: Middleware = async ctx => {
  const { name, startDate, endDate, leagueId, segmentId } = ctx.request.body;

  let stravaSegment;

  if (segmentId) {
    stravaSegment = await StravaSegment.query()
      .select('id', 'name')
      .where('strava_id', segmentId)
      .first();

    if (!stravaSegment) {
      const segmentData = await callCtx(ctx, `segments/${segmentId}`);
      stravaSegment = await StravaSegment.query()
        .insert({
          name: segmentData.name,
          stravaId: segmentId,
          stravaRaw: segmentData,
        })
        .returning('*');
    }
  }

  ctx.body = {
    data: await Round.query().insert({
      name: isEmpty(name) ? stravaSegment && stravaSegment.name : name,
      startDate,
      endDate,
      leagueId,
      stravaSegmentId: stravaSegment && stravaSegment.id,
    }),
  };
};
