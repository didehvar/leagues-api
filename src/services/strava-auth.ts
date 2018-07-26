import { Context } from 'koa';
import fetch from 'node-fetch';

import log from '../log';

export const stravaLogin = async (ctx: Context, code: string) => {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
    }),
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

  return {
    accessToken,
    athlete,
  };
};
