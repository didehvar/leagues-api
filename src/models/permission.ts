import BaseModel from './base-model';

export default class Permission extends BaseModel {
  public static tableName = 'permissions';

  public readonly id!: number;
  public key!: string;
  public name!: string;
  public description!: string;

  public static jsonSchema = {
    type: 'object',
    required: ['key', 'name', 'description'],

    properties: {
      id: { type: 'integer' },
      key: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
    },
  };

  static relationMappings = {};
}
