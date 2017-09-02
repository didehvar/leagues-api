import { Middleware } from 'koa';
import * as createError from 'http-errors';

import Round from '../models/round';
import League from '../models/league';
import StravaSegment from '../models/strava-segment';

export const getRound: Middleware = async (ctx, next) => {
  const { id, slug } = ctx.params;
  const round = await Round.query().findById(id);

  if (!round) throw new createError.NotFound();

  if (!slug) {
    ctx.redirect(`/rounds/${round.id}/${round.slug}`);
    return;
  }

  ctx.body = { data: round };
};

export const roundList: Middleware = async (ctx, next) => {
  ctx.body = { data: await Round.query() };
};

export const createRound: Middleware = async (ctx, next) => {
  const { startDate, endDate, stravaId, leagueId } = ctx.request.body;

  const league = await League.query().findById(leagueId);

  if (!league || !league.id)
    throw new createError.UnprocessableEntity('League not found');

  const stravaSegment = await StravaSegment.query()
    .select('id', 'name')
    .where('strava_id', stravaId)
    .first();

  if (!stravaSegment || !stravaSegment.id)
    throw new createError.UnprocessableEntity('Segment not found');

  ctx.body = {
    data: await Round.query().insert({
      name: stravaSegment.name,
      start_date: startDate,
      end_date: endDate,
      strava_segment_id: stravaSegment.id,
      league_id: league.id,
    }),
  };
};
