import BaseModel from './base-model';

export default class League extends BaseModel {
  public static tableName = 'leagues';

  public readonly id: number;
  public name: string;
  public slug: string;
  public startDate: Date;
  public countryCode: string;
  public disciplineId: number;
  public createdAt: string;
  public updatedAt: string;

  public static jsonSchema = {
    type: 'object',
    required: ['name', 'startDate'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      slug: { type: 'string' },
      startDate: { type: 'string' },
      countryCode: { type: 'string', max: 2 },
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
    rounds: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/round',
      join: {
        from: 'leagues.id',
        to: 'rounds.league_id',
      },
    },
  };

  $beforeInsert() {
    super.$beforeInsert();
    this.slug = this.slugify(this.name);
  }
}
