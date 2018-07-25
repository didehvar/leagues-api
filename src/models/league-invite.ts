import BaseModel from './base-model';

export default class LeagueType extends BaseModel {
  public static tableName = 'league_invites';

  public readonly id: number;
  public code: string;
  public timesUsed: number;
  public userId: number;
  public leagueId: number;
  public createdAt: string;
  public updatedAt: string;

  public static jsonSchema = {
    type: 'object',
    required: ['code', 'userId', 'leagueId'],

    properties: {
      id: { type: 'integer' },
      code: { type: 'string' },
      timesUsed: { type: 'integer' },
      userId: { type: 'integer' },
      leagueId: { type: 'integer' },
    },
  };

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/user',
      filter: (query: any) => query.select('id'),
      join: {
        from: 'league_invites.user_id',
        to: 'users.id',
      },
    },
    league: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'league_invites.league_id',
        to: 'leagues.id',
      },
    },
  };
}
