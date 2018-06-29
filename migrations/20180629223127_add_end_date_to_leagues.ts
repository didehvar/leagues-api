import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('leagues', t => {
      t.dateTime('end_date');
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('leagues', t => {
      t.dropColumn('end_date');
    }),
  );
};
