import { Middleware } from 'koa';
import * as createError from 'http-errors';
import fetch from 'node-fetch';

import log from '../../log';

export const starredSegments: Middleware = async (ctx, next) => {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  });

  const {
    access_token: accessToken,
    athlete,
    errors,
    message,
  } = await res.json();

  if (!res.ok || !accessToken) {
    log.warn('Strava token call failed', {
      status: res.status,
      errors,
      message,
    });
    return ctx.throw(401, 'Invalid Strava code');
  }

  ctx.body = { success: true };
};
