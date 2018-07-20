import * as Router from 'koa-router';

import { leagues, league } from './leagues';

const router = new Router({
  prefix: '/1.1',
});

router.get('/leagues', leagues);
router.get('/leagues/:id', league);

export default router;
