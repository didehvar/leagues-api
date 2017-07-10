import { Middleware } from 'koa';

const responseTime: Middleware = async (ctx, next) => {
  const start = Date.now();
  await next();
  const diff = Date.now() - start;
  ctx.set('X-Response-Time', `${diff}ms`);
};

export default responseTime;
