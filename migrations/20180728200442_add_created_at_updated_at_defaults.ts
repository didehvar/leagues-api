import * as Knex from 'knex';
import { triggers } from '../src/utils/db';

const tables = [
  'league_invites',
  'leagues',
  'points',
  'rounds',
  'segment_efforts',
  'strava_segments',
  'strava_subscriptions',
  'users',
  'webhooks',
];
const ON_UPDATE_TIMESTAMP_FUNCTION = `
  CREATE OR REPLACE FUNCTION on_update_timestamp()
  RETURNS trigger AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
$$ language 'plpgsql';
`;

const DROP_ON_UPDATE_TIMESTAMP_FUNCTION = `DROP FUNCTION on_update_timestamp`;

exports.up = async function(knex: Knex): Promise<any> {
  await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);

  await knex.schema.table('users', t => t.timestamps(true));

  await Promise.all(
    tables.map(async table => await knex.raw(triggers.onUpdate(table))),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  await Promise.all(
    tables.map(async table => await knex.raw(triggers.onUpdateDrop(table))),
  );

  await knex.schema.table('users', t => {
    t.dropColumn('created_at');
    t.dropColumn('updated_at');
  });

  await knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
};
