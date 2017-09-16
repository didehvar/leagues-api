import BaseModel from './base-model';

export default class Discipline extends BaseModel {
  public static tableName = 'disciplines';

  public readonly id: number;
  public name: string;

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
        from: 'disciplines.id',
        to: 'leagues.discipline_id',
      },
    },
  };
}
