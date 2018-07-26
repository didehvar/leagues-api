import BaseModel from './base-model';

export default class Webhook extends BaseModel {
  public static tableName = 'webhooks';

  public readonly id!: number;
  public aspectType!: string;
  public eventTime!: number;
  public objectId!: number;
  public objectType!: string;
  public ownerId!: string;
  public subscriptionId!: number;
  public updates?: object;
  public createdAt!: string;
  public updatedAt!: string;

  public static jsonSchema = {
    type: 'object',
    required: [
      'aspectType',
      'eventTime',
      'objectId',
      'objectType',
      'ownerId',
      'subscriptionId',
    ],

    properties: {
      aspectType: { type: 'string' },
      eventTime: { type: 'integer' },
      objectId: { type: 'integer' },
      objectType: { type: 'string' },
      ownerId: { type: 'integer' },
      subscription_Id: { type: 'integer' },
      updates: { type: 'json' },
    },
  };
}
