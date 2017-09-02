import { Model } from 'objection';
import { sign, Secret } from 'jsonwebtoken';

export default class User extends Model {
  public static tableName = 'users';

  public readonly id: number;
  public email: string;
  public readonly strava_id: number;
  public strava_access_token: string;
  public strava_raw: string;

  public jwtToken() {
    return sign({ email: this.email }, <Secret>process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  public static jsonSchema = {
    type: 'object',
    required: ['email', 'strava_id'],

    properties: {
      id: { type: 'integer' },
      email: { type: 'string', minLength: 1, maxLength: 254 },
      strava_id: { type: 'number' },
      strava_access_token: { type: 'string' },
      strava_raw: { type: 'string' },
    },
  };
}
