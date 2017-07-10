import * as Knex from 'knex';
import { Model } from 'objection';

const knex = Knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  searchPath: 'knex,public',
});

Model.knex(knex);
