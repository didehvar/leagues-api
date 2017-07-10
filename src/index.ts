import app from './app';
import log from './log';

const server = app().listen(3000, () => log.verbose('Running on 3000'));

const cleanup = () => {
  server.close();
  process.exit(1);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGUSR2', cleanup);
process.on('uncaughtException', cleanup);
