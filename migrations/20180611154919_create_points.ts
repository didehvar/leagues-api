import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.createTable('points', t => {
      t.increments();
      t.timestamps();

      t.integer('points').defaultTo(0);

      t.integer('league_id');
      t.foreign('league_id').references('leagues.id');

      t.integer('round_id');
      t.foreign('round_id').references('rounds.id');

      t.integer('user_id');
      t.foreign('user_id').references('users.id');
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(knex.schema.dropTable('points'));
};
