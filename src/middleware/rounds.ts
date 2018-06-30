import { Middleware } from 'koa';
import * as createError from 'http-errors';
import { isBefore, isAfter, startOfDay } from 'date-fns';

import Round from '../models/round';
import League from '../models/league';
import StravaSegment from '../models/strava-segment';
import { callCtx } from '../utils/strava';

const eager = '[points]';

export const getRound: Middleware = async (ctx, next) => {
  const { id, slug } = ctx.params;
  const round = await Round.query()
    .findById(id)
    .eager(eager);

  if (!round) throw new createError.NotFound();

  if (!slug) {
    ctx.redirect(`/rounds/${round.id}/${round.slug}`);
    return;
  }

  ctx.body = { data: round };
};

export const roundList: Middleware = async (ctx, next) => {
  ctx.body = { data: await Round.query().eager(eager) };
};

export const createRound: Middleware = async (ctx, next) => {
  const { leagueId, startDate, endDate, segmentId, name } = ctx.request.body;

  if (isBefore(startDate, startOfDay(new Date())))
    throw new createError.UnprocessableEntity('Round cannot start in the past');

  if (isBefore(endDate, startOfDay(new Date()))) {
    throw new createError.UnprocessableEntity('Round cannot end in the past');
  }

  if (isAfter(startDate, endDate)) {
    throw new createError.UnprocessableEntity(
      'Round start date must be before its end date',
    );
  }

  const league = await League.query().findById(leagueId);

  if (!league) throw new createError.UnprocessableEntity('League not found');
  if (league.userId !== ctx.state.user.id) throw new createError.Unauthorized();

  let stravaSegment: StravaSegment | undefined = undefined;

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
    data: await Round.query()
      .eager(eager)
      .insert({
        name: (stravaSegment && stravaSegment.name) || name,
        startDate,
        endDate,
        leagueId,
        stravaSegmentId: stravaSegment && stravaSegment.id,
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
