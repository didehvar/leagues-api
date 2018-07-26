import BaseModel from './base-model';

export default class LeagueType extends BaseModel {
  public static tableName = 'league_types';

  public readonly id!: number;
  public name!: string;

  public static jsonSchema = {
    type: 'object',
    required: ['id', 'name'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
    },
  };

  static relationMappings = {
    leagues: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'league_types.id',
        to: 'leagues.league_type_id',
      },
    },
  };
}
