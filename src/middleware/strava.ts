import { Middleware } from 'koa';
import fetch from 'node-fetch';

import log from '../log';
import User from '../models/user';
import StravaUser from '../models/strava-user';

export const exchange: Middleware = async ctx => {
  const { code } = ctx.request.body;
  if (!code) return ctx.throw(400);

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
    }),
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

  const stravaUser = (await StravaUser.query().where('id', athlete.id))[0];
  let user: User;

  if (stravaUser) {
    user = (await User.query().where('id', stravaUser.userId))[0];
  } else {
    user = await User.query()
      .insert({
        email: athlete.email,
      })
      .returning('*');

    await user.$relatedQuery<StravaUser>('stravaUsers').insert({
      athleteId: athlete.id,
      accessToken,
      raw: JSON.stringify(athlete),
      userId: user.id,
    });
  }

  ctx.body = { token: user.jwtToken() };
};
