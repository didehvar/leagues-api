import { Middleware } from 'koa';

import User from '../models/User';

export const refreshToken: Middleware = async ctx => {
  const user = await User.query().findById(ctx.state.user.id);
  if (!user) return ctx.throw(404, 'User not found');

  ctx.body = {
    token: user.jwtToken(),
  };
};
