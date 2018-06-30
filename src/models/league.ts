import BaseModel from './base-model';

export default class League extends BaseModel {
  public static tableName = 'leagues';

  public readonly id: number;
  public userId: number;
  public name: string;
  public slug: string;
  public startDate: Date;
  public countryCode: string;
  public disciplineId: number;
  public leagueTypeId: number;
  public private: boolean;
  public createdAt: string;
  public updatedAt: string;

  public static jsonSchema = {
    type: 'object',
    required: ['userId', 'name', 'startDate'],

    properties: {
      id: { type: 'integer' },
      userId: { type: 'integer' },
      name: { type: 'string' },
      slug: { type: 'string' },
      startDate: { type: 'string' },
      countryCode: { type: 'string', max: 2, default: 'gb' },
      private: { type: 'boolean' },
    },
  };

  static relationMappings = {
    discipline: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/discipline',
      join: {
        from: 'leagues.discipline_id',
        to: 'disciplines.id',
      },
    },
    type: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/league-type',
      join: {
        from: 'leagues.league_type_id',
        to: 'league_types.id',
      },
    },
    rounds: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/round',
      join: {
        from: 'leagues.id',
        to: 'rounds.league_id',
      },
    },
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/user',
      join: {
        from: 'leagues.user_id',
        to: 'users.id',
      },
    },
    participants: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: __dirname + '/user',
      join: {
        from: 'leagues.id',
        through: {
          from: 'leagues_participants.league_id',
          to: 'leagues_participants.user_id',
        },
        to: 'users.id',
      },
    },
    points: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/point',
      join: {
        from: 'leagues.id',
        to: 'points.league_id',
      },
    },
  };

  $beforeInsert() {
    super.$beforeInsert();
    this.slug = this.slugify(this.name);
  }
}
