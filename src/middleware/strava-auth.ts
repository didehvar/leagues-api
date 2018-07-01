import { Middleware } from 'koa';
import fetch from 'node-fetch';

import log from '../log';
import User from '../models/user';
import { stravaActivitiesQueue } from '../queues';

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

  let user = await User.query()
    .where('strava_id', athlete.id)
    .first();

  if (!user) {
    user = await User.query()
      .insert({
        email: athlete.email,
        stravaId: athlete.id,
        stravaAccessToken: accessToken,
        stravaRaw: athlete,
        avatar: athlete.profile,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
      })
      .returning('*');

    stravaActivitiesQueue.add(user);
  } else {
    user = await User.query().patchAndFetchById(user.id, {
      stravaAccessToken: accessToken,
      stravaRaw: athlete,
    });
  }

  ctx.body = {
    data: {
      user: {
        id: user.id,
      },
      token: user.jwtToken(),
    },
  };
};
