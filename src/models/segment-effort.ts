import BaseModel from './base-model';

export default class SegmentEffort extends BaseModel {
  public static tableName = 'segment_efforts';

  public readonly id: number;
  public activityId: number;
  public userId: number;
  public stravaSegmentId: number;
  public distance: number;
  public elapsedTime: number;
  public startDate: string;
  public stravaRaw: object | string;
  public createdAt: string;
  public updatedAt: string;

  public static jsonSchema = {
    type: 'object',
    required: [
      'activityId',
      'userId',
      'stravaSegmentId',
      'distance',
      'elapsedTime',
      'startDate',
    ],

    properties: {
      id: { type: 'integer' },
      stravaId: { type: 'integer' },
      userId: { type: 'integer' },
      stravaSegmentId: { type: 'integer' },
      distance: { type: 'number' },
      elapsedTime: { type: 'number' },
      startDate: { type: 'string' },
      stravaRaw: { type: 'object' },
    },
  };

  static relationMappings = {
    activity: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/activity',
      join: {
        from: 'segment_efforts.activity_id',
        to: 'activities.id',
      },
    },
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/user',
      filter: (query: any) => query.select('id'),
      join: {
        from: 'segment_efforts.user_id',
        to: 'users.id',
      },
    },
    stravaSegment: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/strava-segment',
      join: {
        from: 'segment_efforts.strava_segment_id',
        to: 'strava_segments.id',
      },
    },
    rounds: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/round',
      join: {
        from: 'segment_efforts.strava_segment_id',
        to: 'rounds.strava_segment_id',
      },
    },
  };
}
