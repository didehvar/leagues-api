import { Model } from 'objection';

export default class StravaUser extends Model {
  public static tableName = 'StravaUser';

  public readonly id: number;
  public readonly athleteId: number;
  public readonly userId: number;
  public readonly accessToken: string;
  public readonly raw: string;

  public static jsonSchema = {
    type: 'object',
    required: ['id'],

    properties: {
      id: { type: 'integer' },
      athleteId: { type: 'number' },
      accessToken: { type: 'string' },
      raw: { type: 'string' },
      userId: { type: 'integer' },
    },
  };
}
