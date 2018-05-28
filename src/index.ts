import 'dotenv/config';
import * as cluster from 'cluster';

import app from './app';
import log from './log';

async function index() {
  try {
    const port = process.env.PORT || 3000;
    const server = (await app()).listen(port, () => {
      log.verbose(
        `Worker ${process.pid} running on ${server.address().address}${port}`,
      );
    });

    const handleExit = () => {
      server.close();
      process.exit(1);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
    process.on('SIGUSR2', handleExit);
    process.on('uncaughtException', handleExit);
  } catch (ex) {
    log.error('Uncaught exception', ex);
    throw new Error(ex);
  }
}

if (cluster.isMaster) {
  log.verbose(`Master ${process.pid} is running`);

  for (let i = 0; i < parseInt(process.env.WEB_CONCURRENCY || '1'); i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker: any) => {
    log.verbose(`Worker ${worker.process.pid} died`);
  });
} else {
  index();
}
