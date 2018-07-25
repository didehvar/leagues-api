import * as Router from 'koa-router';

import { leagues, league } from './leagues';
import { refreshToken, strava } from './auth';

const router = new Router({
  prefix: '/1.1',
});

router.get('/leagues', leagues);
router.get('/leagues/:id', league);
router.get('/auth/refresh', refreshToken);
router.post('/auth/strava/exchange', strava);

export default router;
