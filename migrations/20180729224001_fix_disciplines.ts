import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  await knex.raw(`update disciplines set name = 'Running' where name = 'run'`);
  await knex.raw(`update disciplines set name = 'Cycling' where name = 'ride'`);
  await knex.raw(`update disciplines set name = 'Walking' where name = 'walk'`);
  await knex.raw(
    `update league_types set name = 'Fastest' where name = 'fastest'`,
  );
  await knex.raw(
    `update league_types set name = 'Distance' where name = 'distance'`,
  );
};

exports.down = async function(knex: Knex): Promise<any> {};
