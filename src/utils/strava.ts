import { Context } from 'koa';
import fetch from 'node-fetch';

import log from '../log';

export async function call(ctx: Context, endpoint: String) {
  const token = ctx.state.user.stravaToken;
  const res = await fetch(
    `https://www.strava.com/api/v3/${endpoint}?access_token=${token}`,
  );

  if (!res.ok) {
    log.warn('Strava starred segments call failed', {
      status: res.status,
    });
    return ctx.throw(500, 'Call to Strava failed');
  }

  return await res.json();
}
