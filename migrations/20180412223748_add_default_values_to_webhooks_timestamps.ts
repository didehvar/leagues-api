import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('webhooks', t => {
      t.timestamps(true, true);
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.table('webhooks', t => {
      t.dropTimestamps();
    }),
  );
};
