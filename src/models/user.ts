import BaseModel from './base-model';
import { sign, Secret } from 'jsonwebtoken';

export default class User extends BaseModel {
  public static tableName = 'users';

  public readonly id: number;
  public email: string;
  public readonly stravaId: number;
  public stravaAccessToken: string;
  public stravaRaw: object;

  public jwtToken() {
    return sign(
      {
        id: this.id,
        email: this.email,
        stravaToken: this.stravaAccessToken,
      },
      <Secret>process.env.JWT_SECRET,
      {
        expiresIn: '30 days',
      },
    );
  }

  public static jsonSchema = {
    type: 'object',
    required: ['email', 'stravaId'],

    properties: {
      id: { type: 'integer' },
      email: { type: 'string', minLength: 1, maxLength: 254 },
      stravaId: { type: 'number' },
      stravaAccessToken: { type: 'string' },
      stravaRaw: { type: 'object' },
    },
  };

  static relationMappings = {
    leagues: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'users.id',
        to: 'leagues.user_id',
      },
    },
    joinedLeagues: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'users.id',
        through: {
          from: 'leagues_participants.user_id',
          to: 'leagues_participants.leagues_id',
        },
        to: 'leagues.id',
      },
    },
    activities: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/activity',
      join: {
        from: 'users.id',
        to: 'activities.user_id',
      },
    },
  };
}
