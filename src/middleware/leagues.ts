import { Middleware } from 'koa';
import * as createError from 'http-errors';
import { isBefore, startOfDay } from 'date-fns';

import League from '../models/league';
import Discipline from '../models/discipline';
import LeagueType from '../models/league-type';
import LeagueInvite from '../models/league-invite';

// todo: this is probably horrendous
const eager = '[rounds.[points], participants, discipline, type, points]';

export const get: Middleware = async (ctx, next) => {
  const { id } = ctx.params;
  const league = await League.query()
    .findById(id)
    .eager(eager);

  if (!league) throw new createError.NotFound();

  ctx.body = {
    data: league,
  };
};

export const list: Middleware = async (ctx, next) => {
  const { page, search, startIndex, stopIndex, userId } = ctx.query;

  let leagues = League.query().eager(eager);
  if (search) leagues = leagues.where('name', 'ilike', `%${search}%`);

  let data;

  if (userId) {
    const results = await leagues.where('user_id', userId);
    data = { results, total: results.length };
  } else if (startIndex && stopIndex) {
    data = await leagues.range(startIndex, stopIndex);
  } else {
    data = await leagues.page(page || 0, 20);
  }

  ctx.body = { data };
};

export const create: Middleware = async (ctx, next) => {
  const { name, startDate, discipline, type } = ctx.request.body;

  if (isBefore(startDate, startOfDay(new Date())))
    throw new createError.UnprocessableEntity(
      'League cannot start in the past',
    );

  const dbDiscipline = await Discipline.query()
    .select('id')
    .where('name', discipline)
    .first();

  if (!dbDiscipline || !dbDiscipline.id)
    throw new createError.UnprocessableEntity('Missing discipline id');

  const dbType = await LeagueType.query()
    .select('id')
    .where('name', type)
    .first();

  if (!dbType || !dbType.id)
    throw new createError.UnprocessableEntity('Missing type id');

  const league = await League.query()
    .eager(eager)
    .insert({
      userId: ctx.state.user.id,
      name,
      startDate,
      disciplineId: dbDiscipline.id,
      leagueTypeId: dbType.id,
    });

  await league.$relatedQuery('participants').relate(ctx.state.user.id);

  ctx.body = {
    data: await league,
  };
};

export const join: Middleware = async (ctx, next) => {
  const id = ctx.state.user.id;
  const league = await League.query()
    .findById(ctx.params.id)
    .eager(eager);

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
  const league = await League.query()
    .findById(ctx.params.id)
    .eager(eager);

  if (!league) return ctx.throw(404, 'League not found');

  const result = await league
    .$relatedQuery('participants')
    .unrelate()
    .where('user_id', id);

  ctx.body = { data: { user: { id } } };
};

export const invite: Middleware = async (ctx, next) => {
  const id = ctx.state.user.id;
  const league = await League.query().findById(ctx.params.id);

  if (!league) return ctx.throw(404, 'League not found');

  const existing = await LeagueInvite.query()
    .where({
      user_id: id,
      league_id: league.id,
    })
    .first();

  if (existing) {
    ctx.body = { data: existing };
    return;
  }

  const result = await LeagueInvite.query()
    .insert({
      code: Math.random()
        .toString(36)
        .substr(2, 9),
      userId: id,
      leagueId: league.id,
    })
    .returning('*');

  ctx.body = { data: result };
};

export const useInvite: Middleware = async (ctx, next) => {
  const id = ctx.state.user.id;
  const { code } = ctx.request.body;
  const league = await League.query().findById(ctx.params.id);

  if (!league) return ctx.throw(404, 'League not found');

  const invite = await LeagueInvite.query().where({
    code,
    league_id: league.id,
  });

  if (!invite) return ctx.throw(400, 'Invite not found');

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
