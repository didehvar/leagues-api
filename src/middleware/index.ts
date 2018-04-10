import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from 'kcors';
import * as jwt from 'koa-jwt';

import { exchange } from './strava-auth';
import handleErrors from './handle-errors';
import responseTime from './response-time';
import { userList } from './users';
import * as leagues from './leagues';
import * as webhooks from './webhooks';
import { createRound } from './rounds';
import { starredSegments } from './strava/segment-finder';
import { refreshToken } from './auth';

export default function(app: Koa) {
  const router = new Router();

  app.use(async (ctx, next) => {
    await next();
    if (ctx.body === undefined) ctx.body = {};
  });

  app.use(cors());
  app.use(bodyParser());

  app.use(handleErrors);
  app.use(responseTime);

  router.get('/', ctx => (ctx.body = 'Hello'));

  router.get('/leagues', leagues.list);
  router.get('/leagues/:id', leagues.get);

  router.post('/auth/strava/exchange', exchange);

  router.use(jwt({ secret: <string>process.env.JWT_SECRET }));

  router.get('/auth/token/refresh', refreshToken);

  router.get('/users/:id/segments/starred', starredSegments);

  router.post('/leagues', leagues.create);
  router.post('/leagues/:id/rounds', createRound);
  router.get('/leagues/:id/join', leagues.join);
  router.get('/leagues/:id/leave', leagues.leave);

  router.post('/webhook', webhooks.create);

  app.use(router.routes());
  app.use(router.allowedMethods());
}
