import { Middleware } from 'koa';
import * as createError from 'http-errors';

import Webhook from '../models/webhook';

export const create: Middleware = async (ctx, next) => {
  const {
    aspect_type,
    event_time,
    object_id,
    object_type,
    owner_id,
    subscription_id,
    updates,
  } = ctx.request.body;

  const webhook = await Webhook.query().insert({
    aspect_type,
    event_time,
    object_id,
    object_type,
    owner_id,
    subscription_id,
    updates,
  });

  ctx.body = {
    data: webhook,
  };
};
