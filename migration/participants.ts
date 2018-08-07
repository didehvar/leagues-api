import { Pool } from 'pg';
import { chunk } from 'lodash';
import config from './config';
import { slugify, impenduloDiscipline } from './helpers';

const participants = async (impenduloPool: Pool, slPool: Pool) => {
  const client = await impenduloPool.connect();

  const { rows: newUsersRows } = await impenduloPool.query(
    `
    select temp_sl_id as id from users
    `,
  );

  const { rows } = await slPool.query(
    `select user_id, league_id from participants p
    join users u on u.id = p.user_id
    where u.created_at > $1 and not u.id = any ($2)
    `,
    [config.FROM_DATE, newUsersRows.map(u => u.id)],
  );

  try {
    await client.query('BEGIN');

    const { rows: users } = await impenduloPool.query(
      'select id, temp_sl_id from users where temp_sl_id = any ($1)',
      [rows.map((u: any) => u.user_id)],
    );

    const { rows: leagues } = await impenduloPool.query(
      'select id, temp_sl_id from leagues where temp_sl_id = any ($1)',
      [rows.map((u: any) => u.league_id)],
    );

    await impenduloPool.query(
      `
        insert into leagues_participants (
          user_id, league_id
        )
        select * from unnest (
          $1::int[],
          $2::int[]
        )
      `,
      rows.reduce(
        (acc: any, part: any) => {
          acc[0].push(users.find(u => u.temp_sl_id === part.user_id).id);
          acc[1].push(leagues.find(l => l.temp_sl_id === part.league_id).id);
          return acc;
        },
        [[], []],
      ),
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    console.log('👏🏻 ', 'Participants migrated');
    client.release();
  }
};

export default participants;
