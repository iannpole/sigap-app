import * as nextEnv from '@next/env';
const loadEnvConfig = (nextEnv as any).loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
if (typeof loadEnvConfig === 'function') {
  loadEnvConfig(process.cwd());
}

import pg from 'pg';

async function run() {
  const client = new pg.Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log('=== COLUMNS ===');
  const cols = await client.query(`
    SELECT table_name, column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_schema='public' 
      AND table_name IN ('kategori','sub_kategori','lokasi_layanans','admins') 
    ORDER BY table_name, ordinal_position;
  `);
  console.log(cols.rows);

  console.log('=== GEOMETRY/GEOGRAPHY COLUMNS IN POSTGIS ===');
  const geomCols = await client.query(`
    SELECT f_table_name, f_geometry_column, coord_dimension, srid, type 
    FROM geometry_columns 
    WHERE f_table_schema='public';
  `);
  console.log('geometry_columns:', geomCols.rows);

  const geogCols = await client.query(`
    SELECT f_table_name, f_geography_column, coord_dimension, srid, type 
    FROM geography_columns 
    WHERE f_table_schema='public';
  `);
  console.log('geography_columns:', geogCols.rows);

  console.log('=== INDEXES ===');
  const idx = await client.query(`
    SELECT tablename, indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname='public' 
      AND tablename IN ('kategori','sub_kategori','lokasi_layanans','admins');
  `);
  console.log(idx.rows);

  console.log('=== CONSTRAINTS ===');
  const con = await client.query(`
    SELECT t.relname, conname, contype, pg_get_constraintdef(c.oid) as def 
    FROM pg_constraint c 
    JOIN pg_class t ON c.conrelid=t.oid 
    WHERE t.relname IN ('kategori','sub_kategori','lokasi_layanans','admins');
  `);
  console.log(con.rows);

  await client.end();
}

run().catch(console.error);
