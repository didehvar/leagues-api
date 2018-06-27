import * as Knex from 'knex';

exports.up = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('activities', t => {
      t.integer('user_id');
      t.foreign('user_id').references('users.id');
    }),
  );
};

exports.down = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('activities', t => {
      t.dropColumn('user_id');
    }),
  );
};
