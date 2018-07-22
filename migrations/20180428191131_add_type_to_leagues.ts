import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  try {
    await knex.schema.createTable('league_types', t => {
      t.increments();
      t.string('name');
    });

    await knex('league_types').insert([
      { id: 1, name: 'Fastest' },
      { id: 2, name: 'Distance' },
    ]);

    await knex.schema.table('leagues', t => {
      t.integer('league_type_id');
      t.foreign('league_type_id').references('league_types.id');
    });
  } catch (ex) {
    return Promise.reject(ex);
  }

  return Promise.resolve();
};

exports.down = async function(knex: Knex): Promise<any> {
  try {
    await knex.schema.table('leagues', t => {
      t.dropColumn('league_type_id');
    });

    await knex.schema.dropTable('league_types');
  } catch (ex) {
    return Promise.reject(ex);
  }

  return Promise.resolve();
};
