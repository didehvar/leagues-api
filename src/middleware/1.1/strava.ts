import { Middleware } from 'koa';
import { callAllPages } from '../../utils/strava';

export const starred: Middleware = async (ctx, next) => {
  ctx.body = await callAllPages(ctx, 'segments/starred');
};
