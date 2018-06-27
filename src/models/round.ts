import BaseModel from './base-model';
import Point from './point';

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
    points: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/point',
      join: {
        from: 'rounds.id',
        to: 'points.round_id',
      },
    },
    segmentEfforts: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/segment-effort',
      join: {
        from: 'rounds.strava_segment_id',
        to: 'segment_efforts.strava_segment_id',
      },
    },
  };

  $beforeInsert() {
    super.$beforeInsert();
    this.slug = this.slugify(this.name);
  }

  async calculatePoints() {
    const efforts: Array<any> = await this.$relatedQuery('segmentEfforts')
      .column('user_id')
      .min('elapsed_time as fastest_time')
      .groupBy('user_id', 'strava_segment_id');

    const startDecrement = Math.floor(efforts.length / 5);

    const points: Array<Point> = efforts
      .sort((a, b) => a.fastestTime - b.fastestTime)
      .slice(0, 25)
      .map(
        ({ userId }, index) =>
          new Point(
            userId,
            this.leagueId,
            this.id,
            index === 0
              ? efforts.length
              : efforts.length - Math.max(startDecrement - index, 1),
          ),
      );

    // TODO: check to see if points are the same before deleting and inserting?

    await this.$relatedQuery('points').delete();
    await this.$relatedQuery('points').insert(points);
  }
}
