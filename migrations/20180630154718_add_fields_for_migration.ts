import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('leagues', t => {
    t.boolean('private');
    t.integer('temp_sl_id');
  });

  await knex.schema.table('users', t => {
    t.integer('temp_sl_id');
  });

  await knex.schema.table('rounds', t => {
    t.integer('temp_sl_id');
  });

  await knex('disciplines').insert([{ id: 3, name: 'walk' }]);

  return Promise.resolve();
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('leagues', t => {
    t.dropColumn('private');
    t.dropColumn('description');
    t.dropColumn('temp_sl_id');
  });

  await knex.schema.table('users', t => {
    t.dropColumn('temp_sl_id');
  });

  await knex.schema.table('rounds', t => {
    t.dropColumn('temp_sl_id');
  });

  return Promise.resolve();
};
