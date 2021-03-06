import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from 'kcors';
import * as jwt from 'koa-jwt';

import { exchange } from './strava-auth';
import handleErrors from './handle-errors';
import responseTime from './response-time';
import * as leagues from './leagues';
import * as webhooks from './webhooks';
import { createRound, deleteRound } from './rounds';
import { starredSegments } from './strava/segment-finder';
import { refreshToken } from './auth';
import v11Router from './1.1';

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

  app.use(jwt({ secret: <string>process.env.JWT_SECRET, passthrough: true }));

  app.use(v11Router.routes());
  app.use(v11Router.allowedMethods());

  router.get('/', ctx => (ctx.body = 'Hello'));

  router.get('/leagues', leagues.list);
  router.get('/leagues/:id', leagues.get);

  router.post('/webhook', webhooks.create);
  router.get('/webhook', webhooks.challenge);
  router.get('/webhook/subscribe', webhooks.subscribe);

  router.post('/auth/strava/exchange', exchange);

  // todo delete
  router.get('/admin/all-points', webhooks.allPoints);

  router.get('/auth/token/refresh', refreshToken);

  router.get('/users/:id/segments/starred', starredSegments);

  router.post('/leagues', leagues.create);
  router.post('/leagues/:id/rounds', createRound);
  router.get('/leagues/:id/join', leagues.join);
  router.get('/leagues/:id/leave', leagues.leave);
  router.get('/leagues/:id/invite', leagues.invite);
  router.post('/leagues/:id/use-invite', leagues.useInvite);
  router.delete('/leagues/:id/rounds/:roundId', deleteRound);

  app.use(router.routes());
  app.use(router.allowedMethods());
}
