import BaseModel from './base-model';

export default class Round extends BaseModel {
  public static tableName = 'rounds';

  public readonly id: number;
  public name: string;
  public slug: string;
  public startDate: Date;
  public endDate: Date;
  public leagueId: number;
  public stravaSegmentId: number;
  public created_at: string;
  public updated_at: string;

  public static jsonSchema = {
    type: 'object',
    required: ['name', 'startDate', 'endDate'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      slug: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
      leagueId: { type: 'number' },
      stravaSegmentId: { type: 'number' },
    },
  };

  static relationMappings = {
    league: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/league',
      join: {
        from: 'rounds.league_id',
        to: 'leagues.id',
      },
    },
    segment: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/strava-segment',
      join: {
        from: 'rounds.strava_segment_id',
        to: 'strava_segments.id',
      },
    },
  };

  $beforeInsert() {
    super.$beforeInsert();
    this.slug = this.slugify(this.name);
  }
}
