import * as request from 'supertest';
import server from '../setup';

test('adds a response time header to the response', async () => {
  const res = await request(server).get('/').expect(200);
  expect(res.header).toEqual(
    expect.objectContaining({ 'x-response-time': expect.any(String) }),
  );
});
