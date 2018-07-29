import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('activities', t => {
    t.index(['user_id']);
  });

  await knex.schema.table('league_invites', t => {
    t.index(['user_id']);
  });

  await knex.schema.table('leagues', t => {
    t.index(['discipline_id', 'user_id', 'league_type_id']);
  });

  await knex.schema.table('leagues_participants', t => {
    t.index(['league_id', 'user_id']);
  });

  await knex.schema.table('points', t => {
    t.index(['league_id', 'user_id', 'round_id']);
  });

  await knex.schema.table('segment_efforts', t => {
    t.index(['activity_id', 'user_id', 'strava_segment_id']);
  });

  await knex.schema.table('strava_segments', t => {
    t.index(['strava_id']);
  });

  await knex.schema.table('users', t => {
    t.index(['strava_id']);
  });
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('activities', t => {
    t.dropIndex(['user_id']);
  });

  await knex.schema.table('league_invites', t => {
    t.dropIndex(['user_id']);
  });

  await knex.schema.table('leagues', t => {
    t.dropIndex(['discipline_id', 'user_id', 'league_type_id']);
  });

  await knex.schema.table('leagues_participants', t => {
    t.dropIndex(['league_id', 'user_id']);
  });

  await knex.schema.table('points', t => {
    t.dropIndex(['league_id', 'user_id', 'round_id']);
  });

  await knex.schema.table('segment_efforts', t => {
    t.dropIndex(['activity_id', 'user_id', 'strava_segment_id']);
  });

  await knex.schema.table('strava_segments', t => {
    t.dropIndex(['strava_id']);
  });

  await knex.schema.table('users', t => {
    t.dropIndex(['strava_id']);
  });
};
