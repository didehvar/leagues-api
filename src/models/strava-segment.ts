import BaseModel from './base-model';

export default class StravaSegment extends BaseModel {
  public static tableName = 'strava_segments';

  public readonly id: number;
  public name: string;
  public stravaId: number;
  public stravaRaw: object | string;
  public createdAt: string;
  public updatedAt: string;

  public static jsonSchema = {
    type: 'object',
    required: ['name', 'stravaId', 'stravaRaw'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      stravaId: { type: 'integer' },
      stravaRaw: { type: 'object' },
    },
  };

  static relationMappings = {
    round: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/round',
      join: {
        from: 'strava_segments.id',
        to: 'rounds.id',
      },
    },
  };
}
