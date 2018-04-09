import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.createTable('activities', t => {
      t.bigInteger('id');
      t.integer('resource_state');
      t.bigInteger('external_id');
      t.bigInteger('upload_id');
      t.bigInteger('athlete_id');
      t.integer('athlete_resource_state');
      t.string('name');
      t.integer('distance');
      t.integer('moving_time');
      t.integer('elapsed_time');
      t.integer('total_elevation_gain');
      t.string('type');
      t.dateTime('start_date');
      t.dateTime('start_date_local');
      t.string('timezone');
      t.integer('utc_offset');
      t.string('start_latlng');
      t.string('end_latlng');
      t.string('location_city');
      t.string('location_state');
      t.string('location_countr');
      t.string('start_latitude');
      t.string('start_longitude');
      t.integer('achievement_count');
      t.integer('kudos_count');
      t.integer('comment_count');
      t.integer('athlete_count');
      t.integer('photo_count');
      t.string('map_id');
      t.string('map_polyline');
      t.integer('map_resource_stat');
      t.boolean('trainer');
      t.boolean('commute');
      t.boolean('manual');
      t.boolean('private');
      t.boolean('flagged');
      t.string('gear_id');
      t.string('from_accepted_tag');
      t.integer('average_speed');
      t.integer('max_speed');
      t.boolean('device_watts');
      t.boolean('has_heartrate');
      t.integer('pr_count');
      t.integer('total_photo_count');
      t.boolean('has_kudoed');
      t.string('workout_type');
      t.text('description');
      t.integer('calories');
      // t.biginteger('segment_efforts');
      t.string('partner_brand_tag');
      t.json('highlighted_kudosers');
      t.string('embed_token');
      t.boolean('segment_leaderboard_opt_out');
      t.boolean('leaderboard_opt_out');
      t.timestamps(true);
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(await knex.schema.dropTable('activities'));
};
