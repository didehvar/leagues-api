import { Middleware } from 'koa';

import League from '../../models/league';
import Point from '../../models/point';

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
    .eager('[rounds.[points], participants, discipline, type, user]')
    .findById(id);

  if (!league) {
    return ctx.throw(404);
  }

  const totalPoints = await Point.query()
    .where('league_id', id)
    .column('user_id')
    .sum('points as points')
    .from('points')
    .groupBy('user_id');

  ctx.body = {
    data: {
      ...league,
      // i don't understand why i have to do this please send help
      points: totalPoints.map((p: any) => ({
        userId: p.userId,
        points: Number.parseInt(p.points),
      })),
    },
  };
};
