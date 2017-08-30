import * as Knex from 'knex';

exports.up = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('leagues', t => {
      t.string('country_code', 2);
    }),
  );
};

exports.down = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('leagues', t => {
      t.dropColumn('country_code');
    }),
  );
};
