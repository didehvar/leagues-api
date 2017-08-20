import * as Koa from 'koa';

import knex from './db';
import log from './log';
import middleware from './middleware';

export default async function() {
  const app = new Koa();

  await knex.migrate.latest();

  app.on('error', (err: Error, ctx: Koa.Context) => {
    if (ctx.status >= 500) log.error('Server error', { err, stack: err.stack });
  });

  middleware(app);

  return app;
}
