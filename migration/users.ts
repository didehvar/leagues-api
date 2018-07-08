import { Pool } from 'pg';
import { chunk } from 'lodash';
import config from './config';

const users = async (impenduloPool: Pool, slPool: Pool) => {
  const client = await impenduloPool.connect();

  const { rows } = await slPool.query(
    `
    select
      id, email, uid, access_token,
      profile, first_name, last_name
    from users
    where created_at > $1
  `,
    [config.FROM_DATE],
  );

  try {
    await client.query('BEGIN');
    const chunks: Array<Array<any>> = chunk(rows, config.CHUNK_AMOUNT);

    for (const chunk of chunks) {
      await impenduloPool.query(
        `
        insert into users (email, strava_id, strava_access_token, avatar, firstname, lastname, temp_sl_id)
        select * from unnest (
          $1::text[],
          $2::int[],
          $3::text[],
          $4::text[],
          $5::text[],
          $6::text[],
          $7::int[]
        )
      `,
        chunk.reduce(
          (acc: any, user: any) => {
            acc[0].push(user.email);
            acc[1].push(user.uid);
            acc[2].push(user.access_token);
            acc[3].push(user.profile);
            acc[4].push(user.first_name);
            acc[5].push(user.last_name);
            acc[6].push(user.id);
            return acc;
          },
          [[], [], [], [], [], [], []],
        ),
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    console.log('👌🏻 ', 'Users migrated');
    client.release();
  }
};

export default users;
