import { Middleware } from 'koa';
import { QueryBuilder } from 'objection';

import User from '../../models/user';
import { stravaActivitiesQueue } from '../../queues';
import { stravaLogin } from '../../services/strava-auth';

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

  const { accessToken, athlete } = await stravaLogin(ctx, code);

  const user = await User.query()
    .where('strava_id', athlete.id)
    .first();

  let queryBuilder: QueryBuilder<User, User, User>;

  if (user) {
    queryBuilder = user
      .$query()
      .patch({
        stravaAccessToken: accessToken,
        stravaRaw: athlete,
      })
      .returning('*');
  } else {
    let avatar = athlete.profile;
    if (!avatar.startsWith('http')) {
      avatar =
        'https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-c24d50e30120b015208ed9d313060f6700d4dc60bebc4bc62371959448d2e66f.png';
    }

    queryBuilder = User.query()
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
  }

  const updatedUser = await queryBuilder.eager('role');

  ctx.body = {
    data: {
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
      },
      token: updatedUser.jwtToken(),
    },
  };
};
