import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.createTable('webhooks', t => {
      t.string('aspect_type');
      t.integer('event_time');
      t.integer('object_id');
      t.string('object_type');
      t.integer('owner_id');
      t.integer('subscription_id');
      t.json('updates');
      t.timestamps(true);
    }),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve(await knex.schema.dropTable('webhooks'));
};
