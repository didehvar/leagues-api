import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  try {
    await knex.schema.createTable('disciplines', t => {
      t.increments();

      t.string('name');
      t.index(['name']);
    });

    await knex('disciplines').insert([
      { id: 1, name: 'run' },
      { id: 2, name: 'ride' },
    ]);

    await knex.schema.createTable('leagues', t => {
      t.increments();
      t.timestamps(true);

      t.string('name');
      t.string('slug');
      t.dateTime('start_date');

      t.integer('discipline_id');
      t.foreign('discipline_id').references('disciplines.id');
    });
  } catch (ex) {
    return Promise.reject(ex);
  }

  return Promise.resolve();
};

exports.down = async function(knex: Knex): Promise<any> {
  try {
    await knex.schema.dropTable('leagues');
    await knex.schema.dropTable('disciplines');
  } catch (ex) {
    return Promise.reject(ex);
  }

  return Promise.resolve();
};
