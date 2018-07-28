import { Middleware } from 'koa';

import League from '../../models/league';
import Point from '../../models/point';
import Discipline from '../../models/discipline';
import LeagueType from '../../models/league-type';

const leagueEager =
  '[rounds.[points.[user],segment], participants, discipline, type, user, points.[user]]';

export const leagues: Middleware = async ctx => {
  const { search, userId, startIndex = 0, stopIndex = 20 } = ctx.query;

  ctx.body = {
    data: await League.query()
      .orderBy('created_at', 'desc')
      .modify(builder => {
        if (search) builder.where('name', 'ilike', `%${search}%`);
        if (userId) builder.where('user_id', userId);
      })
      .eager('[discipline, type, user]')
      .range(startIndex, stopIndex),
  };
};

export const league: Middleware = async ctx => {
  const { id } = ctx.params;
  const league = await League.query()
    .eager(leagueEager)
    .modifyEager('participants', builder => {
      builder.select('id', 'firstname', 'lastname', 'avatar');
    })
    .findById(id);

  if (!league) {
    return ctx.throw(404);
  }

  ctx.body = {
    data: league,
  };
};

export const create: Middleware = async ctx => {
  const { name, startDate, discipline, type, visibility } = ctx.request.body;

  const dbDiscipline = await Discipline.query()
    .select('id')
    .where('name', discipline)
    .first();

  if (!dbDiscipline) return ctx.throw(400, 'Missing discipline id');

  const dbType = await LeagueType.query()
    .select('id')
    .where('name', type)
    .first();

  if (!dbType) return ctx.throw(400, 'Missing type id');

  const league = await League.query()
    .eager(leagueEager)
    .insert({
      userId: ctx.state.user.id,
      name,
      startDate,
      disciplineId: dbDiscipline.id,
      leagueTypeId: dbType.id,
      private: visibility.toLowerCase() === 'private',
    });

  await league.$relatedQuery('participants').relate(ctx.state.user.id);

  ctx.body = {
    data: league,
  };
};
