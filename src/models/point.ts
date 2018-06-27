import BaseModel from './base-model';

export default class Point extends BaseModel {
  public static tableName = 'points';

  public readonly id: number;

  constructor(
    public userId: number,
    public leagueId: number,
    public roundId: number,
    public points: number,
  ) {
    super();
  }

  public static jsonSchema = {
    type: 'object',
    required: ['points', 'leagueId', 'userId'],

    properties: {
      id: { type: 'integer' },
      points: { type: 'integer' },
      leagueId: { type: 'number' },
      roundId: { type: 'number' },
      userId: { type: 'number' },
    },
  };

  static relationMappings = {
    league: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'points.league_id',
        to: 'leagues.id',
      },
    },
    round: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/round',
      join: {
        from: 'points.round_id',
        to: 'rounds.id',
      },
    },
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/user',
      join: {
        from: 'points.user_id',
        to: 'users.id',
      },
    },
  };
}
