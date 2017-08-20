import * as Knex from 'knex';

exports.up = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.createTable('users', t => {
      t.increments();
      t.string('email');

      t.integer('strava_id').unique();
      t.string('strava_access_token');
      t.jsonb('strava_raw');
    }),
  );
};

exports.down = function(knex: Knex): Promise<any> {
  return Promise.resolve(knex.schema.dropTable('users'));
};
