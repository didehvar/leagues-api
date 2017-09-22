import { Middleware } from 'koa';
import * as createError from 'http-errors';

import League from '../models/league';
import Discipline from '../models/discipline';

export const getLeague: Middleware = async (ctx, next) => {
  const { id } = ctx.params;
  const league = await League.query().findById(id);

  if (!league) throw new createError.NotFound();

  const rounds = await league.$relatedQuery('rounds');
  ctx.body = { data: { ...league, rounds } };
};

export const leagueList: Middleware = async (ctx, next) => {
  ctx.body = { data: await League.query() };
};

export const createLeague: Middleware = async (ctx, next) => {
  const { name, startDate, discipline } = ctx.request.body;

  const dbDiscipline = await Discipline.query()
    .select('id')
    .where('name', discipline)
    .first();

  if (!dbDiscipline || !dbDiscipline.id)
    throw new createError.UnprocessableEntity('Missing discipline id');

  const league = await League.query().insert({
    userId: ctx.state.user.id,
    name,
    startDate,
    disciplineId: dbDiscipline.id,
  });

  await league.$relatedQuery('participants').relate(ctx.state.user.id);

  ctx.body = {
    data: league,
  };
};

export const joinLeague: Middleware = async (ctx, next) => {};
