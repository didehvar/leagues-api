import { Middleware } from 'koa';
import * as createError from 'http-errors';
import fetch from 'node-fetch';

import log from '../../log';
import { call } from '../../utils/strava';

export const starredSegments: Middleware = async (ctx, next) => {
  ctx.body = { data: await call(ctx, 'segments/starred') };
};
