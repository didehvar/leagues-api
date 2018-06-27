import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.createTable('segment_efforts', t => {
      t.increments();
      t.timestamps();

      t.float('distance');
      t.integer('elapsed_time');
      t.dateTime('start_date');

      t.integer('activity_id');
      t
        .foreign('activity_id')
        .references('activities.id')
        .onDelete('CASCADE');

      t.integer('user_id');
      t.foreign('user_id').references('users.id');

      t.integer('strava_segment_id');
      t.foreign('strava_segment_id').references('strava_segments.id');

      t.jsonb('strava_raw');
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(knex.schema.dropTable('segment_efforts'));
};
