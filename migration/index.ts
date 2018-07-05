import { Pool } from 'pg';
import users from './users';
import leagues from './leagues';
import participants from './participants';
import rounds from './rounds';
import activities from './activities';
import * as Knex from 'knex';
import { Model } from 'objection';

const start = async () => {
  const knex = Knex({
    client: 'pg',
    connection: process.env.IMPENDULO_DB,
    searchPath: 'knex,public',
  });

  Model.knex(knex);

  const impenduloPool = new Pool({
    connectionString: process.env.IMPENDULO_DB,
    ssl: true,
  });

  const slPool = new Pool({
    connectionString: process.env.SL_DB,
    ssl: true,
  });

  try {
    // await impenduloPool.query('delete from segment_efforts');
    // await impenduloPool.query('delete from webhooks');
    await impenduloPool.query('delete from activities');
    // await impenduloPool.query('delete from league_invites');
    // await impenduloPool.query('delete from leagues_participants');
    // await impenduloPool.query('delete from points');
    // await impenduloPool.query('delete from rounds');
    // await impenduloPool.query('delete from leagues');
    // await impenduloPool.query('delete from users');
    // await impenduloPool.query('delete from strava_segments');

    // await users(impenduloPool, slPool);
    // await leagues(impenduloPool, slPool);
    // await participants(impenduloPool, slPool);
    // await rounds(impenduloPool, slPool);
    await activities(impenduloPool, slPool);
  } catch (e) {
    console.error(e);
  } finally {
    await impenduloPool.end();
    await slPool.end();
  }
};

start();
