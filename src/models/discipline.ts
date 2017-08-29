import { Model } from 'objection';

export default class Discipline extends Model {
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
    disciplines: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'disciplines.id',
        to: 'leagues.disciplineId',
      },
    },
  };
}
