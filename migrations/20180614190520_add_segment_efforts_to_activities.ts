import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('activities', t => {
      t.jsonb('segment_efforts');
      t.unique(['strava_id']);
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('activities', t => {
      t.dropColumn('segment_efforts');
      t.dropUnique(['strava_id']);
    }),
  );
};
