import { Middleware } from 'koa';
import League from '../models/league';
import Discipline from '../models/discipline';

export const leagueList: Middleware = async (ctx, next) => {
  ctx.body = { data: await League.query() };
};

export const createLeague: Middleware = async (ctx, next) => {
  const { name, startDate, discipline } = ctx.request.body;
  console.log('🦄', name, startDate, discipline);

  const dbDiscipline = await Discipline.query()
    .select('id')
    .where('name', discipline)
    .first();

  if (!dbDiscipline || !dbDiscipline.id) throw Error('Missing discipline id');

  ctx.body = {
    data: await League.query().insert({
      name,
      start_date: startDate,
      discipline_id: dbDiscipline.id,
    }),
  };
};
