import app from './app';
import log from './log';

async function index() {
  try {
    const port = process.env.PORT || 3000;
    const server = (await app()).listen(port, () => {
      log.verbose(`Running at ${server.address().address}${port}`);
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

index();
