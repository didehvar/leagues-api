import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.createTable('league_invites', t => {
      t.increments();
      t.timestamps();

      t.string('code');
      t.integer('times_used').defaultTo(0);

      t.integer('user_id');
      t.foreign('user_id').references('users.id');

      t.integer('league_id');
      t.foreign('league_id').references('leagues.id');

      t.unique(['code']);
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(knex.schema.dropTable('league_invites'));
};
