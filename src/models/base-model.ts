import { Model } from 'objection';
import { Dictionary, mapKeys, snakeCase, camelCase } from 'lodash';

export default class BaseModel extends Model {
  slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  $beforeInsert() {
    const anyThis = <any>this;

    if (anyThis.hasOwnProperty('createdAt')) {
      anyThis.createdAt = new Date().toISOString();
    }

    if (
      anyThis.hasOwnProperty('stravaRaw') &&
      typeof anyThis.stravaRaw === 'object'
    ) {
      anyThis.stravaRaw = JSON.stringify(anyThis.stravaRaw);
    }
  }

  $beforeUpdate() {
    const anyThis = <any>this;

    if (anyThis.hasOwnProperty('updatedAt')) {
      anyThis.updatedAt = new Date().toISOString();
    }

    if (
      anyThis.hasOwnProperty('stravaRaw') &&
      typeof anyThis.stravaRaw === 'object'
    ) {
      anyThis.stravaRaw = JSON.stringify(anyThis.stravaRaw);
    }
  }

  $formatDatabaseJson(json: object): object {
    json = super.$formatDatabaseJson(json);
    return mapKeys<any, string>(json, (value, key) => snakeCase(key));
  }

  $parseDatabaseJson(json: object): object {
    json = mapKeys<any, string>(json, (value, key) => camelCase(key));
    return super.$parseDatabaseJson(json);
  }
}
