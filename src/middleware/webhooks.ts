import { Middleware } from 'koa';
import * as createError from 'http-errors';
import { stravaQueue } from '../queues';

import Webhook from '../models/webhook';

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
