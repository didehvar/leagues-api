import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';

import { exchange } from './strava';
import handleErrors from './handle-errors';
import responseTime from './response-time';

export default function(app: Koa) {
  const router = new Router();

  app.use(bodyParser());

  app.use(handleErrors);
  app.use(responseTime);

  router.get('/', ctx => (ctx.body = 'Hello Slapi'));

  router.post('/auth/strava/exchange', exchange);

  app.use(router.routes());
  app.use(router.allowedMethods());
}
