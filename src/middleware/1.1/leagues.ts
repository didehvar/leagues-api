import { Middleware } from 'koa';

import League from '../../models/league';

export const leagues: Middleware = async ctx => {
  const { search, userId, startIndex = 0, stopIndex = 20 } = ctx.query;

  ctx.body = {
    data: await League.query()
      .orderBy('start_date', 'desc')
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
    .eager('[rounds.[points], participants, discipline, type, points, user]')
    .findById(id);

  if (!league) {
    return ctx.throw(404);
  }

  ctx.body = {
    data: league,
  };
};
