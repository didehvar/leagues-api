import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('activities', t => {
    t.dropColumn('id');
  });

  await knex.schema.table('activities', t => {
    t.increments();
  });

  return Promise.resolve();
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('activities', t => {
    t.dropColumn('id');
  });

  await knex.schema.table('activities', t => {
    t.bigInteger('id');
  });

  return Promise.resolve();
};
