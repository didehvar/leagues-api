import { Middleware } from 'koa';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import { stringify } from 'querystring';
import log from '../log';
import { stravaQueue } from '../queues';

import Webhook from '../models/webhook';
import StravaSubscription from '../models/strava-subscription';
import Round from '../models/round';

export const create: Middleware = async (ctx, next) => {
  const {
    aspect_type: aspectType,
    event_time: eventTime,
    object_id: objectId,
    object_type: objectType,
    owner_id: ownerId,
    subscription_id: subscriptionId,
    updates,
  } = ctx.request.body;

  const webhook = await Webhook.query()
    .insert({
      aspectType,
      eventTime,
      objectId,
      objectType,
      ownerId,
      subscriptionId,
      updates,
    })
    .returning('*');

  stravaQueue.add(webhook);

  ctx.status = 200;
};

export const subscribe: Middleware = async (ctx, next) => {
  if (ctx.query.secret !== process.env.STRAVA_SUBSCRIBE_SECRET) {
    ctx.status = 404;
    return;
  }

  const body = new FormData();
  body.append('client_id', process.env.STRAVA_CLIENT_ID);
  body.append('client_secret', process.env.STRAVA_CLIENT_SECRET);
  body.append('callback_url', ctx.query.callback_url);
  body.append('verify_token', process.env.STRAVA_VERIFY_TOKEN);

  const res = await fetch('https://api.strava.com/api/v3/push_subscriptions', {
    method: 'POST',
    body,
  });

  if (!res.ok) {
    throw new Error('Failed to create subscription');
  }

  const {
    id,
    callback_url: callbackUrl,
    created_at: createdAt,
    updated_at: updatedAt,
  } = await res.json();

  await StravaSubscription.query().insert({
    stravaId: id,
    callbackUrl,
    createdAt,
    updatedAt,
  });

  ctx.status = 200;
};

export const challenge: Middleware = async (ctx, next) => {
  const {
    'hub.mode': hubMode,
    'hub.verify_token': hubVerifyToken,
    'hub.challenge': hubChallenge,
  } = ctx.request.query;

  if (hubVerifyToken !== process.env.STRAVA_VERIFY_TOKEN) {
    throw new Error('Incorrect verify token');
  }

  ctx.body = { 'hub.challenge': hubChallenge };
};

// todo : delete this
export const allPoints: Middleware = async (ctx, next) => {
  if (ctx.query.secret !== process.env.STRAVA_SUBSCRIBE_SECRET) {
    ctx.status = 404;
    return;
  }

  stravaQueue.add({
    allPoints: true,
    roundId: ctx.query.roundId || undefined,
    leagueId: ctx.query.leagueId || undefined,
  });
  ctx.status = 200;
};
