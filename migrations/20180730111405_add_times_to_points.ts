import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('points', t => {
    t.string('score');
  });
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('points', t => {
    t.dropColumn('score');
  });
};
