import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.schema.createTable('roles', t => {
    t.increments();
    t.timestamps();

    t.string('name').unique();
  });

  await knex.schema.createTable('permissions', t => {
    t.increments();

    t.string('key').unique();
    t.string('name').unique();
    t.text('description');
  });

  await knex.schema.createTable('roles_permissions', t => {
    t.integer('role_id');
    t.foreign('role_id').references('roles.id');

    t.integer('permission_id');
    t.foreign('permission_id').references('permissions.id');
  });

  await knex('roles').insert([
    { id: 1, name: 'user' },
    { id: 2, name: 'admin' },
  ]);

  await knex.schema.table('users', t => {
    t.integer('role_id')
      .notNullable()
      .defaultTo(1);
    t.foreign('role_id').references('roles.id');
  });
};

exports.down = async function(knex: Knex): Promise<any> {
  await knex.schema.table('users', t => {
    t.dropColumn('role_id');
  });

  await knex.schema.dropTable('roles_permissions');
  await knex.schema.dropTable('permissions');
  await knex.schema.dropTable('roles');
};
