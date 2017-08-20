import { Middleware } from 'koa';
import User from '../models/user';

export const userList: Middleware = async (ctx, next) => {
  ctx.body = { users: await User.query() };
};
