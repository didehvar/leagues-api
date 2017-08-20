import { Model } from 'objection';
import { sign, Secret } from 'jsonwebtoken';

export default class User extends Model {
  public static tableName = 'users';

  public readonly id: number;
  public email: string;
  public readonly stravaId: number;
  public stravaAccessToken: string;
  public stravaRaw: string;

  public jwtToken() {
    return sign({ email: this.email }, <Secret>process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'email', 'stravaId'],

    properties: {
      id: { type: 'integer' },
      email: { type: 'string', minLength: 1, maxLength: 254 },
      stravaId: { type: 'number' },
      stravaAccessToken: { type: 'string' },
      stravaRaw: { type: 'string' },
    },
  };
}
