import { Model } from 'objection';

export default class Round extends Model {
  public static tableName = 'rounds';

  public readonly id: number;
  public name: string;
  public slug: string;
  public start_date: Date;
  public end_date: Date;
  public league_id: number;
  public strava_segment_id: number;
  public created_at: string;
  public updated_at: string;

  public static jsonSchema = {
    type: 'object',
    required: ['name', 'start_date', 'end_date', 'strava_id'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      slug: { type: 'string' },
      start_date: { type: 'string' },
      end_date: { type: 'string' },
      strava_id: { type: 'string' },
      strava_segment_id: { type: 'string' },
    },
  };

  static relationMappings = {
    league: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'rounds.league_id',
        to: 'leagues.id',
      },
    },
    segment: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/segment',
      join: {
        from: 'rounds.strava_segment_id',
        to: 'strava_segments.id',
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
