import * as Knex from 'knex';

exports.up = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('strava_segments', t => {
      t.unique(['strava_id']);
    }),
  );
};

exports.down = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('strava_segments', t => {
      t.dropUnique(['strava_id']);
    }),
  );
};
