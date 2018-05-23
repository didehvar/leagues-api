import * as Queue from 'bull';
import * as Redis from 'ioredis';

const client = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

const options = {
  createClient: (type: string) => {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      default:
        return new Redis(process.env.REDIS_URL);
    }
  },
};

export const stravaQueue = new Queue('strava webhooks', options);
