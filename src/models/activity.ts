import { ModelOptions, QueryContext } from 'objection';

import BaseModel from './base-model';

import League from './league';
import Round from './round';

export default class Activity extends BaseModel {
  public static tableName = 'activities';

  public readonly id: number;
  public userId: number;
  public stravaId: number;
  public resourceState: number;
  public externalId: number;
  public uploadId: number;
  public athleteId: number;
  public athleteResourceState: number;
  public name: string;
  public distance: number;
  public movingTime: number;
  public elapsedTime: number;
  public totalElevationGain: number;
  public type: string;
  public startDate: Date;
  public startDateLocal: Date;
  public timezone: string;
  public utcOffset: number;
  public startLatlng: string;
  public endLatlng: string;
  public locationCity: string;
  public locationState: string;
  public locationCountry: string;
  public startLatitude: string;
  public startLongitude: string;
  public achievementCount: number;
  public kudosCount: number;
  public commentCount: number;
  public athleteCount: number;
  public photoCount: number;
  public mapId: string;
  public mapPolyline: string;
  public mapResourceStat: number;
  public trainer: boolean;
  public commute: boolean;
  public manual: boolean;
  public private: boolean;
  public flagged: boolean;
  public gearId: string;
  public fromAcceptedTag: string;
  public averageSpeed: number;
  public maxSpeed: number;
  public deviceWatts: boolean;
  public hasHeartrate: boolean;
  public prCount: number;
  public totalPhotoCount: number;
  public hasKudoed: boolean;
  public workoutType: string;
  public description: string;
  public calories: number;
  public partnerBrandTag: string;
  public highlightedKudosers: object;
  public embedToken: string;
  public segmentLeaderboardOptOut: boolean;
  public leaderboardOptOut: boolean;
  public raw: object;

  public readonly segmentEfforts: null;

  public static jsonSchema = {
    type: 'object',
    required: ['userId', 'stravaId', 'athleteId', 'raw'],

    properties: {
      userId: { type: 'number' },
      stravaId: { type: 'nummber' },
      resourceState: { type: 'number' },
      externalId: { type: 'string' },
      uploadId: { type: 'number' },
      athleteId: { type: 'number' },
      athleteResourceState: { type: 'number' },
      name: { type: 'string' },
      distance: { type: 'number' },
      movingTime: { type: 'number' },
      elapsedTime: { type: 'number' },
      totalElevationGain: { type: 'number' },
      type: { type: 'string' },
      startDate: { type: 'Date' },
      startDateLocal: { type: 'Date' },
      timezone: { type: 'string' },
      utcOffset: { type: 'number' },
      startLatlng: { type: 'array' },
      endLatlng: { type: 'array' },
      locationCity: { type: ['string', 'null'] },
      locationState: { type: ['string', 'null'] },
      locationCountry: { type: 'string' },
      startLatitude: { type: 'number' },
      startLongitude: { type: 'number' },
      achievementCount: { type: 'number' },
      kudosCount: { type: 'number' },
      commentCount: { type: 'number' },
      athleteCount: { type: 'number' },
      photoCount: { type: 'number' },
      mapId: { type: 'string' },
      mapPolyline: { type: 'string' },
      mapResourceStat: { type: 'number' },
      trainer: { type: 'boolean' },
      commute: { type: 'boolean' },
      manual: { type: 'boolean' },
      private: { type: 'boolean' },
      flagged: { type: 'boolean' },
      gearId: { type: ['string', 'null'] },
      fromAcceptedTag: { type: 'boolean' },
      averageSpeed: { type: 'number' },
      maxSpeed: { type: 'number' },
      deviceWatts: { type: 'boolean' },
      hasHeartrate: { type: 'boolean' },
      prCount: { type: 'number' },
      totalPhotoCount: { type: 'number' },
      hasKudoed: { type: 'boolean' },
      workoutType: { type: ['number', 'null'] },
      description: { type: ['string', 'null'] },
      calories: { type: 'number' },
      partnerBrandTag: { type: ['string', 'null'] },
      highlightedKudosers: { type: 'array' },
      embedToken: { type: 'string' },
      segmentLeaderboardOptOut: { type: 'boolean' },
      leaderboardOptOut: { type: 'boolean' },
      raw: { type: 'object ' },
    },
  };

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: __dirname + '/user',
      filter: (query: any) => query.select('id'),
      join: {
        from: 'activities.user_id',
        to: 'users.id',
      },
    },
    segmentEfforts: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/segment-effort',
      join: {
        from: 'activities.id',
        to: 'segment_efforts.activity_id',
      },
    },
  };
}
