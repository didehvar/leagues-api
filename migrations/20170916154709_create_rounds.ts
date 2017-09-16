import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.createTable('rounds', t => {
      t.increments();
      t.timestamps(true);

      t.string('name');
      t.string('slug');

      t.dateTime('start_date');
      t.dateTime('end_date');

      t.integer('league_id');
      t.foreign('league_id').references('leagues.id');

      t.integer('strava_segment_id');
      t.foreign('strava_segment_id').references('strava_segments.id');
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(await knex.schema.dropTable('rounds'));
};
