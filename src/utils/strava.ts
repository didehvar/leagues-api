import { Context } from 'koa';
import { stringify } from 'querystring';
import fetch from 'node-fetch';

import log from '../log';

export async function call(token: string, endpoint: string) {
  const res = await fetch(
    `https://www.strava.com/api/v3/${endpoint}?access_token=${token}`,
  );

  if (!res.ok) {
    log.warn('Strava starred segments call failed', {
      status: res.status,
      statusText: res.statusText,
    });
    throw new Error(`Call to Strava failed ${res.statusText}`);
  }

  return await res.json();
}

export async function callCtx(ctx: Context, endpoint: string) {
  const token = ctx.state.user.stravaToken;
  try {
    return await call(token, endpoint);
  } catch (ex) {
    return ctx.throw(500, ex.message);
  }
}

interface Parameters {
  page?: number;
  perPage?: number;
}

export async function callPage(
  ctx: Context,
  endpoint: string,
  parameters?: Parameters,
) {
  const params: Parameters = { ...parameters };
  if (!params.page) params.page = 1;
  if (!params.perPage) params.perPage = 30;

  const query = stringify({
    access_token: ctx.state.user.stravaToken,
    page: params.page || 1,
    per_page: params.perPage,
  });

  const res = await fetch(`https://www.strava.com/api/v3/${endpoint}?${query}`);

  if (!res.ok) {
    log.error('Strava starred segments call failed', {
      status: res.status,
      error: await res.json(),
    });
    return ctx.throw(500, 'Call to Strava failed');
  }

  const data = await res.json();
  return {
    data,
    ...params,
    nextPage: params && params.perPage >= data.length,
  };
}

export async function callAllPages(ctx: Context, endpoint: string) {
  const perPage = 30;
  let data: any[] = [];
  let segments: any[] = [];
  let page = 1;

  do {
    const query = stringify({
      access_token: ctx.state.user.stravaToken,
      page: page++,
      per_page: perPage,
    });

    const res = await fetch(
      `https://www.strava.com/api/v3/${endpoint}?${query}`,
    );

    if (!res.ok) {
      log.error('Strava starred segments call failed', {
        status: res.status,
        error: await res.json(),
      });
      return ctx.throw(500, 'Call to Strava failed');
    }

    segments = await res.json();
    data = data.concat(
      segments.map(({ id, name, activity_type }) => ({
        id,
        name,
        activityType: activity_type,
      })),
    );
  } while (segments.length === perPage);

  return {
    data,
  };
}
