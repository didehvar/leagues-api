import { Middleware } from 'koa';
import * as createError from 'http-errors';

import League from '../models/league';
import Discipline from '../models/discipline';

export const get: Middleware = async (ctx, next) => {
  const { id } = ctx.params;
  const league = await League.query().findById(id);

  if (!league) throw new createError.NotFound();

  ctx.body = {
    data: await league.$loadRelated('[rounds, participants, discipline]'),
  };
};

export const list: Middleware = async (ctx, next) => {
  const { page, search, startIndex, stopIndex } = ctx.query;

  let leagues = League.query().eager('discipline');
  if (search) leagues = leagues.where('name', 'like', `%${search}%`);

  let data;

  if (startIndex && stopIndex) {
    data = await leagues.range(startIndex, stopIndex);
  } else {
    data = await leagues.page(page || 0, 20);
  }

  ctx.body = { data };
};

export const create: Middleware = async (ctx, next) => {
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
    data: await league.$loadRelated('discipline'),
  };
};

export const join: Middleware = async (ctx, next) => {
  const id = ctx.state.user.id;
  const league = await League.query().findById(ctx.params.id);
  if (!league) return ctx.throw(404, 'League not found');

  try {
    await league.$relatedQuery('participants').relate(id);
  } catch (ex) {
    if (
      !ex.constraint ||
      ex.constraint !== 'leagues_participants_league_id_user_id_unique'
    ) {
      throw ex;
    }
  }

  ctx.body = { data: { user: { id } } };
};

export const leave: Middleware = async (ctx, next) => {
  const id = ctx.state.user.id;
  const league = await League.query().findById(ctx.params.id);
  if (!league) return ctx.throw(404, 'League not found');

  const result = await league
    .$relatedQuery('participants')
    .unrelate()
    .where('user_id', id);

  ctx.body = { data: { user: { id } } };
};
