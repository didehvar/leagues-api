import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('activities', t => {
    t.dropColumn('distance');
    t.dropColumn('moving_time');
    t.dropColumn('total_elevation_gain');
    t.dropColumn('start_latitude');
    t.dropColumn('start_longitude');
    t.dropColumn('average_speed');
    t.dropColumn('max_speed');
    t.dropColumn('calories');

    t.dropColumn('external_id');
  });

  await knex.schema.table('activities', t => {
    t.float('distance');
    t.float('moving_time');
    t.float('total_elevation_gain');
    t.float('start_latitude');
    t.float('start_longitude');
    t.float('average_speed');
    t.float('max_speed');
    t.float('calories');

    t.string('external_id');

    t.jsonb('raw');
  });

  return Promise.resolve();
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('activities', t => {
    t.dropColumn('distance');
    t.dropColumn('moving_time');
    t.dropColumn('total_elevation_gain');
    t.dropColumn('start_latitude');
    t.dropColumn('start_longitude');
    t.dropColumn('average_speed');
    t.dropColumn('max_speed');
    t.dropColumn('calories');

    t.dropColumn('external_id');
  });

  await knex.schema.table('activities', t => {
    t.integer('distance');
    t.integer('moving_time');
    t.integer('total_elevation_gain');
    t.integer('start_latitude');
    t.integer('start_longitude');
    t.integer('average_speed');
    t.integer('max_speed');
    t.integer('calories');

    t.integer('external_id');
  });

  return Promise.resolve();
};
