import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.createTable('leagues_participants', t => {
      t.integer('league_id');
      t.foreign('league_id').references('leagues.id');

      t.integer('user_id');
      t.foreign('user_id').references('users.id');
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(await knex.schema.dropTable('leagues_participants'));
};
