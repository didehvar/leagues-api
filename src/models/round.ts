import BaseModel from './base-model';
import { QueryBuilder } from 'objection';
import Point from './point';
import SegmentEffort from './segment-effort';
import League from './league';
import User from './user';
import knex from '../db';
import StravaSegment from './strava-segment';

export default class Round extends BaseModel {
  public static tableName = 'rounds';

  public readonly id!: number;
  public name!: string;
  public slug!: string;
  public startDate!: Date;
  public endDate!: Date;
  public leagueId!: number;
  public stravaSegmentId?: number;
  public created_at!: string;
  public updated_at!: string;

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
      filter: (query: QueryBuilder<StravaSegment>) =>
        query.select('id', 'name', 'strava_id'),
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
    const { leagueId } = this;
    let efforts: Array<any> = [];

    if (this.stravaSegmentId) {
      // fastest league
      efforts = await this.$relatedQuery<SegmentEffort>('segmentEfforts')
        .join('leagues_participants', function() {
          this.on(
            'leagues_participants.league_id',
            knex.raw('?', [leagueId]),
          ).andOn('leagues_participants.user_id', 'segment_efforts.user_id');
        })
        .column('segment_efforts.user_id')
        .min('segment_efforts.elapsed_time as fastest_time')
        .groupBy(
          'segment_efforts.user_id',
          'segment_efforts.strava_segment_id',
        );
    } else {
      // distance league
      efforts = await SegmentEffort.query()
        .join('leagues_participants', function() {
          this.on(
            'leagues_participants.league_id',
            knex.raw('?', [leagueId]),
          ).andOn('leagues_participants.user_id', 'segment_efforts.user_id');
        })
        .where('segment_efforts.start_date', '>', this.startDate)
        .where('segment_efforts.start_date', '<', this.endDate)
        .column('segment_efforts.user_id')
        .sum('segment_efforts.distance as total_distance')
        .groupBy('segment_efforts.user_id');
    }

    let decAmount = Math.floor(efforts.length / 5);

    const sort = this.stravaSegmentId ? 'fastestTime' : 'totalDistance';

    const points: Array<Point> = efforts
      .sort((a, b) => a[sort] - b[sort])
      .slice(0, 25)
      .map(
        ({ userId, fastestTime, totalDistance }, index) =>
          new Point(
            userId,
            this.leagueId,
            this.id,
            index === 0
              ? efforts.length
              : Math.max(efforts.length - (decAmount += index), 0),
            totalDistance,
            fastestTime,
          ),
      );

    // TODO: check to see if points are the same before deleting and inserting?

    await this.$relatedQuery('points').delete();
    await this.$relatedQuery('points').insert(points);
  }
}
