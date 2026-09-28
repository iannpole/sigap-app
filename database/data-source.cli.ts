import 'reflect-metadata';
import * as nextEnv from '@next/env';
import { DataSource } from 'typeorm';
import { entities } from '../entities';

const loadEnvConfig =
  (nextEnv as any).loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;

if (typeof loadEnvConfig === 'function') {
  loadEnvConfig(process.cwd());
}

const cliDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
  entities,
  migrations: ['database/migrations/*.ts'],
  synchronize: false,
  installExtensions: false,
});

export default cliDataSource;
