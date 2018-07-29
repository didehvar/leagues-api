import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('leagues', t => {
    t.index(['discipline_id']);
    t.index(['user_id']);
    t.index(['league_type_id']);
  });

  await knex.schema.table('leagues_participants', t => {
    t.index(['league_id']);
    t.index(['user_id']);
  });

  await knex.schema.table('points', t => {
    t.index(['league_id', 'user_id']);
    t.index(['round_id', 'user_id']);
    t.index(['league_id', 'round_id']);
  });

  await knex.schema.table('segment_efforts', t => {
    t.dropIndex(['activity_id', 'user_id', 'strava_segment_id']);
    t.index(['activity_id']);
    t.index(['user_id']);
    t.index(['strava_segment_id']);
    t.index(['start_date']);
  });
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('leagues', t => {
    t.dropIndex(['discipline_id']);
    t.dropIndex(['user_id']);
    t.dropIndex(['league_type_id']);
  });

  await knex.schema.table('leagues_participants', t => {
    t.dropIndex(['league_id']);
    t.dropIndex(['user_id']);
  });

  await knex.schema.table('points', t => {
    t.dropIndex(['league_id', 'user_id']);
    t.dropIndex(['round_id', 'user_id']);
    t.dropIndex(['league_id', 'round_id']);
  });

  await knex.schema.table('segment_efforts', t => {
    t.index(['activity_id', 'user_id', 'strava_segment_id']);
    t.dropIndex(['activity_id']);
    t.dropIndex(['user_id']);
    t.dropIndex(['strava_segment_id']);
    t.dropIndex(['start_date']);
  });
};
