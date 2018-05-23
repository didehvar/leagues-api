import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('activities', t => {
      t.bigInteger('strava_id');
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('activities', t => {
      t.dropColumn('strava_id');
    }),
  );
};
