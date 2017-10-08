import * as Knex from 'knex';

exports.up = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('leagues_participants', t => {
      t.unique(['league_id', 'user_id']);
    }),
  );
};

exports.down = function(knex: Knex): Promise<any> {
  return Promise.resolve(
    knex.schema.table('leagues_participants', t => {
      t.dropUnique(['league_id', 'user_id']);
    }),
  );
};
