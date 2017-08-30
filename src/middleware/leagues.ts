import { Middleware } from 'koa';
import * as createError from 'http-errors';

import League from '../models/league';
import Discipline from '../models/discipline';

export const getLeague: Middleware = async (ctx, next) => {
  const { id, slug } = ctx.params;
  const league = await League.query().findById(id);

  if (!league) throw new createError.NotFound();

  if (!slug) {
    ctx.redirect(`/leagues/${league.id}/${league.slug}`);
    return;
  }

  ctx.body = { data: league };
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

  ctx.body = {
    data: await League.query().insert({
      name,
      start_date: startDate,
      discipline_id: dbDiscipline.id,
    }),
  };
};
