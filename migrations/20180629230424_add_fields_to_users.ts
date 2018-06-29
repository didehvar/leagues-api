import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('users', t => {
    t.string('avatar');
    t.string('firstname');
    t.string('lastname');
  });

  await knex.schema.raw(`
    update users set
      avatar = strava_raw->>'profile',
      firstname = strava_raw->>'firstname',
      lastname = strava_raw->>'lastname'
  `);

  return Promise.resolve();
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('users', t => {
      t.dropColumn('avatar');
      t.dropColumn('firstname');
      t.dropColumn('lastname');
    }),
  );
};
