import * as Knex from 'knex';

exports.up = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.createTable('strava_users', t => {
      t.increments();
      t.integer('athlete_id').primary();
      t.string('access_token');
      t.jsonb('raw');
      t.foreign('user_id').references('users.id');
    }),
  );
};

exports.down = function(knex: Knex): Promise<any> {
  return Promise.resolve(knex.schema.dropTable('users'));
};
