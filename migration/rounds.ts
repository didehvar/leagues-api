import { Pool } from 'pg';
import { chunk, uniqBy } from 'lodash';
import config from './config';
import { slugify, impenduloDiscipline } from './helpers';

const rounds = async (impenduloPool: Pool, slPool: Pool) => {
  const client = await impenduloPool.connect();

  const { rows } = await slPool.query(`
    select
      id, league_id, created_at, updated_at, start, "end", name
    from rounds
  `);

  const { rows: segments } = await slPool.query(`
    select
      strava_id, created_at, updated_at, round_id, segment_data
    from segments
  `);

  try {
    await client.query('BEGIN');

    const { rows: stravaSegments } = await impenduloPool.query(
      `
      insert into strava_segments (
        created_at, updated_at, name, strava_id, strava_raw
      )
      select * from unnest (
        $1::timestamp[],
        $2::timestamp[],
        $3::text[],
        $4::int[],
        $5::jsonb[]
      )
      returning id, strava_id, name
    `,
      uniqBy(segments, 'strava_id').reduce(
        (acc: any, segment: any) => {
          acc[0].push(segment.created_at);
          acc[1].push(segment.updated_at);
          acc[2].push(segment.segment_data.name);
          acc[3].push(segment.strava_id);
          acc[4].push(segment.segment_data);
          return acc;
        },
        [[], [], [], [], []],
      ),
    );

    const chunks: Array<Array<any>> = chunk(rows, config.CHUNK_AMOUNT);

    for (const chunk of chunks) {
      const {
        rows: leagues,
      } = await impenduloPool.query(
        'select id, temp_sl_id from leagues where temp_sl_id = any ($1)',
        [chunk.map((l: any) => l.league_id)],
      );

      await impenduloPool.query(
        `
        insert into rounds (
          created_at, updated_at, name, slug, start_date, end_date,
          league_id, strava_segment_id, temp_sl_id
        )
        select * from unnest (
          $1::timestamp[],
          $2::timestamp[],
          $3::text[],
          $4::text[],
          $5::timestamp[],
          $6::timestamp[],
          $7::int[],
          $8::int[],
          $9::int[]
        )
      `,
        chunk.reduce(
          (acc: any, round: any) => {
            const segment =
              stravaSegments.find(
                s =>
                  s.strava_id ===
                  (segments.find(se => se.round_id === round.id) || {})
                    .strava_id,
              ) || {};
            acc[0].push(round.created_at);
            acc[1].push(round.updated_at);
            acc[2].push(round.name || segment.name);
            acc[3].push(slugify(round.name));
            acc[4].push(round.start);
            acc[5].push(round.end);
            acc[6].push(leagues.find(l => l.temp_sl_id === round.league_id).id);
            acc[7].push(segment.id);
            acc[8].push(round.id);
            return acc;
          },
          [[], [], [], [], [], [], [], [], []],
        ),
      );
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    console.log('🤚🏻 ', 'Rounds migrated');
    client.release();
  }
};

export default rounds;
