import BaseModel from './base-model';

export default class Webhook extends BaseModel {
  public static tableName = 'webhooks';

  public readonly id: number;
  public aspect_type: string;
  public event_time: number;
  public object_id: number;
  public object_type: string;
  public owner_id: string;
  public subscription_id: number;
  public updates: object;
  public createdAt: string;
  public updatedAt: string;

  public static jsonSchema = {
    type: 'object',
    required: [
      'aspect_type',
      'event_time',
      'object_id',
      'object_type',
      'owner_id',
      'subscription_id',
    ],

    properties: {
      aspect_type: { type: 'string' },
      event_time: { type: 'integer' },
      object_id: { type: 'integer' },
      object_type: { type: 'string' },
      owner_id: { type: 'integer' },
      subscription_id: { type: 'integer' },
      updates: { type: 'json' },
    },
  };

  static relationMappings = {};

  $beforeInsert() {
    super.$beforeInsert();
  }
}
