import { Middleware } from 'koa';
import * as createError from 'http-errors';
import fetch from 'node-fetch';

import log from '../../log';

export const starredSegments: Middleware = async (ctx, next) => {
  const res = await fetch(
    `https://www.strava.com/api/v3/segments/starred?access_token=${ctx.state
      .user.stravaToken}`,
  );

  const data = await res.json();

  if (!res.ok) {
    log.warn('Strava starred segments call failed', {
      status: res.status,
    });
    return ctx.throw(500, 'Call to Strava failed');
  }

  ctx.body = { data };
};
