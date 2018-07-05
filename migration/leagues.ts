import { Pool } from 'pg';
import { chunk } from 'lodash';
import config from './config';
import { slugify, impenduloDiscipline } from './helpers';

const leagues = async (impenduloPool: Pool, slPool: Pool) => {
  const client = await impenduloPool.connect();

  const { rows } = await slPool.query(`
    select
      id, name, private, user_id, created_at, updated_at,
      description, discipline, league_type
    from leagues
  `);

  try {
    await client.query('BEGIN');
    const chunks: Array<Array<any>> = chunk(rows, config.CHUNK_AMOUNT);

    for (const chunk of chunks) {
      const {
        rows: users,
      } = await impenduloPool.query(
        'select id, temp_sl_id from users where temp_sl_id = any ($1)',
        [chunk.map((l: any) => l.user_id)],
      );

      await impenduloPool.query(
        `
        insert into leagues (
          created_at, updated_at, name, slug, start_date,
          discipline_id, user_id, league_type_id, temp_sl_id, private
        )
        select * from unnest (
          $1::timestamp[],
          $2::timestamp[],
          $3::text[],
          $4::text[],
          $5::timestamp[],
          $6::int[],
          $7::int[],
          $8::int[],
          $9::int[],
          $10::bool[]
        )
      `,
        chunk.reduce(
          (acc: any, league: any) => {
            acc[0].push(league.created_at);
            acc[1].push(league.updated_at);
            acc[2].push(league.name);
            acc[3].push(slugify(league.name));
            acc[4].push(league.created_at);
            acc[5].push(impenduloDiscipline(league.discipline));
            acc[6].push(users.find(u => u.temp_sl_id === league.user_id).id);
            acc[7].push(league.league_type + 1);
            acc[8].push(league.id);
            acc[9].push(league.private);
            return acc;
          },
          [[], [], [], [], [], [], [], [], [], []],
        ),
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    console.log('👍🏻 ', 'Leagues migrated');
    client.release();
  }
};

export default leagues;
