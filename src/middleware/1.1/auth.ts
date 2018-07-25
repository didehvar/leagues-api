import { Middleware } from 'koa';
import fetch from 'node-fetch';

import log from '../../log';
import User from '../../models/user';
import { stravaActivitiesQueue } from '../../queues';

export const refreshToken: Middleware = async ctx => {
  const user = await User.query().findById(ctx.state.user.id);
  if (!user) return ctx.throw(404, 'User not found');

  ctx.body = {
    data: { token: user.jwtToken() },
  };
};

export const strava: Middleware = async ctx => {
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
    let avatar = athlete.profile;
    if (!avatar.startsWith('http')) {
      avatar =
        'https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-c24d50e30120b015208ed9d313060f6700d4dc60bebc4bc62371959448d2e66f.png';
    }

    user = await User.query()
      .insert({
        email: athlete.email,
        stravaId: athlete.id,
        stravaAccessToken: accessToken,
        stravaRaw: athlete,
        avatar,
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
