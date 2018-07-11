import * as Router from 'koa-router';

import { leagues } from './leagues';

const router = new Router({
  prefix: '/1.1',
});

router.get('/leagues', leagues);

export default router;
