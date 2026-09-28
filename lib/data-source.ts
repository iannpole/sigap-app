import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from '../entities';

declare global {
  // eslint-disable-next-line no-var
  var __typeormDataSourcePromise: Promise<DataSource> | undefined;
}

export async function getDataSource(): Promise<DataSource> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Please define DATABASE_URL in your environment variables.'
    );
  }

  if (globalThis.__typeormDataSourcePromise) {
    try {
      const ds = await globalThis.__typeormDataSourcePromise;
      if (ds.isInitialized) {
        return ds;
      }
    } catch {
      // Reset if the cached promise failed
    }
    globalThis.__typeormDataSourcePromise = undefined;
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url,
    ssl: { rejectUnauthorized: false },
    entities,
    synchronize: false,
    installExtensions: false,
    logging: ['error', 'warn'],
    extra: {
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    },
  });

  const initPromise = dataSource.initialize().catch((err) => {
    globalThis.__typeormDataSourcePromise = undefined;
    throw err;
  });

  globalThis.__typeormDataSourcePromise = initPromise;
  return initPromise;
}
