import BaseModel from './base-model';

export default class Role extends BaseModel {
  public static tableName = 'roles';

  public readonly id!: number;
  public name!: string;

  public static jsonSchema = {
    type: 'object',
    required: ['name'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
    },
  };

  static relationMappings = {
    users: {
      relation: BaseModel.HasManyRelation,
      modelClass: __dirname + '/user',
      join: {
        from: 'roles.id',
        to: 'users.role_id',
      },
    },
    permissions: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: __dirname + '/permission',
      join: {
        from: 'roles.id',
        through: {
          from: 'roles_permissions.role_id',
          to: 'roles_permissions.id',
        },
        to: 'permissions.id',
      },
    },
  };
}
