import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from 'kcors';

import { exchange } from './strava-auth';
import handleErrors from './handle-errors';
import responseTime from './response-time';
import { userList } from './users';
import { leagueList, createLeague } from './leagues';

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

  router.post('/auth/strava/exchange', exchange);

  app.use(router.routes());
  app.use(router.allowedMethods());
}
