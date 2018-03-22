import * as Knex from 'knex';
import { Model } from 'objection';

const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  searchPath: 'knex,public',
});

Model.knex(knex);

export default knex;
