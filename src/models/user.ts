import { Model } from 'objection';
import { sign } from 'jsonwebtoken';

import StravaUser from './strava-user';

export default class User extends Model {
  public static tableName = 'User';

  public readonly id: number;
  public email: string;

  public jwtToken() {
    return sign({ email: this.email }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  public static jsonSchema = {
    type: 'object',
    required: ['username', 'email'],

    properties: {
      id: { type: 'integer' },
      email: { type: 'string', minLength: 1, maxLength: 254 },
    },
  };

  public static relationMappings = {
    stravaUsers: {
      relation: Model.HasOneRelation,
      modelClass: StravaUser,
      join: {
        from: 'users.id',
        to: 'strava_users.user_id',
      },
    },
  };
}
