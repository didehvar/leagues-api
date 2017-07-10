import * as request from 'supertest';
import * as nock from 'nock';

import server from '../setup';

jest.mock('uuid/v4');

let call: request.Test;
let apiCall = nock('https://www.strava.com').post('/oauth/token');

beforeEach(() => {
  call = request(server).post('/auth/strava/exchange');
});

test('errors if there is no code', async () => {
  await call.expect(400);
});

test('errors if strava code is invalid', async () => {
  apiCall.reply(401, {});
  await call.send({ code: 'code' }).expect(401);
});

test('creates a new user if one does not already exist', async () => {
  apiCall.reply(200, {});
  await call.send({ code: 'code' }).expect(200);
});

test('returns a token on successful strava auth', async () => {
  const token = 'token';
  const athlete = { id: 123, name: 'name' };

  apiCall.reply(200, { access_token: 'accessToken', athlete });
  await call.send({ code: 'code' }).expect(200, { token });
});
