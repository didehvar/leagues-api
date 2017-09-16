import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.createTable('strava_segments', t => {
      t.increments();
      t.timestamps(true);

      t.string('name');
      t.integer('strava_id');
      t.jsonb('strava_raw');
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(await knex.schema.dropTable('strava_segments'));
};
