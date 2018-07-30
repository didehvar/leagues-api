import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('points', t => {
    t.dropColumn('score');
    t.float('distance');
    t.integer('elapsed_time');
  });
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('points', t => {
    t.string('score');
    t.dropColumn('distance');
    t.dropColumn('elapsed_time');
  });
};
