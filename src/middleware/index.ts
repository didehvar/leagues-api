import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from 'kcors';
import * as jwt from 'koa-jwt';

import { exchange } from './strava-auth';
import handleErrors from './handle-errors';
import responseTime from './response-time';
import { userList } from './users';
import { getLeague, leagueList, createLeague, joinLeague } from './leagues';
import { createRound } from './rounds';
import { starredSegments } from './strava/segment-finder';
import { refreshToken } from './auth';

export default function(app: Koa) {
  const router = new Router();

  app.use(cors());
  app.use(bodyParser());

  app.use(handleErrors);
  app.use(responseTime);

  router.get('/', ctx => (ctx.body = 'Hello'));

  router.get('/leagues', leagueList);
  router.get('/leagues/:id', getLeague);

  router.post('/auth/strava/exchange', exchange);

  router.use(jwt({ secret: <string>process.env.JWT_SECRET }));

  router.get('/auth/token/refresh', refreshToken);

  router.get('/users/:id/segments/starred', starredSegments);

  router.post('/leagues', createLeague);
  router.post('/leagues/:id/rounds', createRound);
  router.get('/leagues/:id/join', joinLeague);

  app.use(router.routes());
  app.use(router.allowedMethods());
}
