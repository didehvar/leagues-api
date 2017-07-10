import { Middleware } from 'koa';

import { BodyError, BodyMessage } from '../types/body';

const handleErrors: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const body: BodyError = { message: BodyMessage.Unknown, error: true };

    if (err.expose) body.message = err.message;
    if (err.status === 401) body.message = BodyMessage.Unauthorised;

    ctx.status = err.status || 500;
    ctx.body = body;

    ctx.app.emit('error', err, ctx);
  }
};

export default handleErrors;
