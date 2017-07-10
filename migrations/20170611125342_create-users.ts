import * as Knex from 'knex';

exports.up = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.createTable('users', t => {
      t.increments();
      t.string('email');
    }),
  );
};

exports.down = function(knex: Knex): Promise<any> {
  return Promise.resolve(knex.schema.dropTable('users'));
};
