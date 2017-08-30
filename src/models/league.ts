import { Model } from 'objection';

export default class League extends Model {
  public static tableName = 'leagues';

  public readonly id: number;
  public name: string;
  public slug: string;
  public start_date: Date;
  public country_code: string;
  public discipline_id: number;
  public created_at: string;
  public updated_at: string;

  public static jsonSchema = {
    type: 'object',
    required: ['name', 'start_date'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      slug: { type: 'string' },
      start_date: { type: 'string' },
      country_code: { type: 'string', max: 2 },
    },
  };

  static relationMappings = {
    disciplines: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/discipline',
      join: {
        from: 'leagues.discipline_id',
        to: 'disciplines.id',
      },
    },
  };

  $beforeInsert() {
    this.slug = this.name
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

    this.created_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}
