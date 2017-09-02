import { Model } from 'objection';

export default class StravaSegment extends Model {
  public static tableName = 'strava_segments';

  public readonly id: number;
  public name: string;
  public strava_id: number;
  public strava_raw: string;
  public created_at: string;
  public updated_at: string;

  public static jsonSchema = {
    type: 'object',
    required: ['name', 'strava_id'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      strava_id: { type: 'integer' },
      strava_raw: { type: 'string' },
    },
  };

  static relationMappings = {
    league: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'strava_segments.id',
        to: 'rounds.id',
      },
    },
  };

  $beforeInsert() {
    this.created_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
}
