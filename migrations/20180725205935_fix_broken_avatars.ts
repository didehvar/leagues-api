import * as Knex from 'knex';

exports.up = async function(knex: Knex): Promise<any> {
  return Promise.resolve(
    await knex.schema.raw(`
      update users set
      avatar = 'https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-c24d50e30120b015208ed9d313060f6700d4dc60bebc4bc62371959448d2e66f.png'
      where avatar not like 'http%'
    `),
  );
};

exports.down = async function(knex: Knex): Promise<any> {
  return Promise.resolve();
};
