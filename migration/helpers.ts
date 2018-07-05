import fetch from 'node-fetch';
import { format } from 'date-fns';
import { stringify } from 'querystring';

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

export const impenduloDiscipline = (discipline: number) => {
  switch (discipline) {
    case 0:
      return 2;
    case 1:
      return 1;
    case 2:
      return 3;
    default:
      return 2;
  }
};

export class StravaCallError extends Error {
  constructor(public status: number, ...args: any[]) {
    super(...args);
    Error.captureStackTrace(this, StravaCallError);
  }
}

export const stravaActivities = async (token: string, queryParams: object) => {
  const query = stringify({
    access_token: token,
    ...queryParams,
  });

  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?${query}`,
  );

  if (!res.ok) {
    console.error(
      '🕷 ',
      'Request failed',
      JSON.stringify({
        status: res.status,
        statustext: res.statusText,
        token,
        query,
      }),
    );

    throw new StravaCallError(
      res.status,
      `Call to Strava failed ${res.statusText}`,
    );
  }

  const data = await res.json();

  console.log('🎉 ', format(new Date(), 'HH:mm:ss'), 'Strava call succeeded');

  return data;
};
