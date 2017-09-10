import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from 'kcors';
import * as jwt from 'koa-jwt';

import { exchange } from './strava-auth';
import handleErrors from './handle-errors';
import responseTime from './response-time';
import { userList } from './users';
import { getLeague, leagueList, createLeague } from './leagues';
import { starredSegments } from './strava/segment-finder';

export default function(app: Koa) {
  const router = new Router();

  app.use(cors());
  app.use(bodyParser());

  app.use(handleErrors);
  app.use(responseTime);

  router.get('/', ctx => (ctx.body = 'Hello Slapi'));
  router.get('/users', userList);

  router.get('/leagues', leagueList);
  router.post('/leagues', createLeague);
  router.get('/leagues/:id', getLeague);
  router.get('/leagues/:id/:slug', getLeague);

  router.post('/auth/strava/exchange', exchange);

  router.use(jwt({ secret: <string>process.env.JWT_SECRET }));

  router.get('/users/:id/segments/starred', starredSegments);

  app.use(router.routes());
  app.use(router.allowedMethods());
}
