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
        else
          builder.andWhere(queryBuilder => {
            queryBuilder.where('private', false).orWhereNull('private');
            if (ctx.state.user) {
              queryBuilder
                .orWhere('leagues.user_id', ctx.state.user.id)
                .orWhereExists(function() {
                  this.select('*')
                    .from('leagues_participants')
                    .whereRaw('leagues_participants.league_id = leagues.id')
                    .andWhere(
                      'leagues_participants.user_id',
                      ctx.state.user.id,
                    );
                });
            }
          });
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

export const join: Middleware = async ctx => {
  const league = await League.query().findById(ctx.params.id);

  if (!league) return ctx.throw(404, 'League not found');

  // TODO: RECALCULATE THE POINTS

  try {
    const result: any = await league
      .$relatedQuery('participants')
      .relate(ctx.state.user.id);

    ctx.body = { data: { leagueId: result.league_id, userId: result.user_id } };
  } catch (ex) {
    if (
      !ex.constraint ||
      ex.constraint !== 'leagues_participants_league_id_user_id_unique'
    ) {
      return ctx.throw(500, ex);
    }
  }
};
