import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.createTable('strava_subscriptions', t => {
      t.increments();
      t.timestamps();

      t.integer('strava_id');
      t.string('callback_url');
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(knex.schema.dropTable('strava_subscriptions'));
};
