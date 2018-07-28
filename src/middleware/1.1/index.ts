import { Middleware } from 'koa';
import * as Router from 'koa-router';

import { refreshToken, strava } from './auth';
import { leagues, league, create } from './leagues';
import { starred } from './strava';

const router = new Router({
  prefix: '/1.1',
});

router.get('/leagues', leagues);
router.get('/leagues/:id', league);
router.get('/auth/refresh', refreshToken);
router.post('/auth/strava/exchange', strava);

router.use((ctx, next) => {
  if (!ctx.state.user || !ctx.state.user.id) return ctx.throw(401);
  return next();
});

router.post('/leagues/create', create);
router.get('/strava/starred', starred);

export default router;
