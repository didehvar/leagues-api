import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.table('activities', t => {
    t.string('title');
  });
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('activities', t => {
    t.dropColumn('title');
  });
};
