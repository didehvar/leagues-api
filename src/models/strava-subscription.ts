import BaseModel from './base-model';

export default class StravaSubscription extends BaseModel {
  public static tableName = 'strava_subscriptions';

  public readonly id!: number;
  public stravaId!: number;
  public callbackUrl!: string;
  public createdAt!: string;
  public updatedAt!: string;

  public static jsonSchema = {
    type: 'object',
    required: ['stravaId', 'callbackUrl'],

    properties: {
      id: { type: 'integer' },
      stravaId: { type: 'integer' },
      callbackUrl: { type: 'string' },
    },
  };

  static relationMappings = {};
}
