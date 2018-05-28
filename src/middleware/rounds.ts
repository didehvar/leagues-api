import { Middleware } from 'koa';
import * as createError from 'http-errors';

import Round from '../models/round';
import League from '../models/league';
import StravaSegment from '../models/strava-segment';
import { callCtx } from '../utils/strava';

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
  const { leagueId, startDate, endDate, segmentId } = ctx.request.body;

  const league = await League.query().findById(leagueId);

  if (!league) throw new createError.UnprocessableEntity('League not found');
  if (league.userId !== ctx.state.user.id) throw new createError.Unauthorized();

  let stravaSegment = await StravaSegment.query()
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

  ctx.body = {
    data: await Round.query()
      .insert({
        name: stravaSegment.name,
        startDate,
        endDate,
        leagueId,
        stravaSegmentId: stravaSegment.id,
      })
      .returning('*'),
  };
};

export const deleteRound: Middleware = async (ctx, next) => {
  const { id, roundId } = ctx.params;

  const league = await League.query().findById(id);
  if (!league) throw new createError.UnprocessableEntity('League not found');
  if (league.userId !== ctx.state.user.id) throw new createError.Unauthorized();

  ctx.body = {
    data: await league
      .$relatedQuery('rounds')
      .deleteById(roundId)
      .returning('*'),
  };
};
