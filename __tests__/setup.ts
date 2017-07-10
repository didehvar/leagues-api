import { disableNetConnect, enableNetConnect, cleanAll } from 'nock';
import app from 'app';

disableNetConnect();
enableNetConnect('127.0.0.1');

let server = app().listen();

afterAll(() => {
  server.close();

  cleanAll();
  enableNetConnect();
});

export default server;
