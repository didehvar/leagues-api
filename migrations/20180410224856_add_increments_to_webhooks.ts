import * as Knex from 'knex';

exports.up = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('webhooks', t => {
      t.increments();
    }),
  );
};

exports.down = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('webhooks', t => {
      t.dropColumn('id');
    }),
  );
};
